/**
 * @module internal
 */

import ajax from '../util/ajax';

import rewrite from './rewrite';

import dispatch from './dispatch';

/**
 * Send request (dispatched after delay).
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} modifiedUri - uri to request (actual uri).
 * @param {string} requestedUri - uri that user requested (shown in location bar).
 * @param {boolean} pushState - pushes to history or not.
 * @return {void}
 */
let sendRequest = (instance, modifiedUri, requestedUri, pushState) => {
	// Load fail counter
	let failCount = 0;

	// An option sent for ajax
	let option = {
		// uri to load
		uri: modifiedUri,
		// success handler
		onload(xhr) {
			let response = xhr.responseText;
			// Modify response if modifier exists
			let contents = instance._modifier.response
				? instance._modifier.response(response)
				: response;

			// Rewrite container
			rewrite(instance, contents);

			// Push to history when
			// 1. current request is not first load and
			// 2. not the popstate request
			if (!!instance._previousUri && pushState) {
				window.history.pushState(requestedUri, null, requestedUri);
			}

			// Remember current uri.
			instance._previousUri = modifiedUri;

			dispatch(instance, 'loadcomplete', {
				xhr: xhr,
				response: contents
			});
		},
		// error handler
		onerror(code, message) {
			// Increment fail count.
			failCount += 1;

			if (failCount < instance._retry) {
				// If retriable, show warning message to console and send request again.
				console.warn(`pjax: failed to load :: (${code}) Retrying...(${failCount})`);

				ajax(option);
			} else {
				// If cannot retry, show error message to console and dispatch 'loaderror' event.
				console.error(`pjax: failed to load :: (${code}) ${message}`);

				dispatch(instance, 'loaderror', {
					code: code | 0,
					message: message
				});
			}
		}
	};

	ajax(option);

};

export default sendRequest;
