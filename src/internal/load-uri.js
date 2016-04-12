/**
 * @module internal
 */

import dispatch from './dispatch';

import sendRequest from './send-request';

/**
 * Load uri.
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} uri - request uri.
 * @param {boolean} pushState - push uri to history or not.
 * @return {boolean} true:request sent, false:interrupted.
 */
let loadUri = (instance, uri, pushState) => {
	// Variables for detecting cancel action.
	let cancel = false,
		canceler = () => {
			cancel = true;
		};

	dispatch(instance, 'beforeload', {
		uri: uri,
		cancel: canceler
	});

	// If canceler called, interrupt loading.
	if (cancel) {
		return false;
	}

	// Modify uri if modifier is set.
	let modifiedUri = instance._modifier.uri
		? instance._modifier.uri(uri)
		: uri;

	// If requested uri is same to current uri, interrupt loading.
	if (modifiedUri === instance._previousUri) {
		return false;
	}

	dispatch(instance, 'loadstart', {
		uri: uri
	});

	// Bind parameters to sender function.
	let senderFn = () => {
		sendRequest(instance, modifiedUri, uri, pushState);
	};

	// Call sender function with delay
	if (typeof instance._delay === 'function') {
		instance._delay(senderFn);
	} else {
		window.setTimeout(senderFn, instance._delay);
	}

	return true;
};

export default loadUri;
