'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ajax = require('../util/ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var _rewrite = require('./rewrite');

var _rewrite2 = _interopRequireDefault(_rewrite);

var _dispatch = require('./dispatch');

var _dispatch2 = _interopRequireDefault(_dispatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Send request (dispatched after delay).
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} modifiedUri - uri to request (actual uri).
 * @param {string} requestedUri - uri that user requested (shown in location bar).
 * @param {boolean} pushState - pushes to history or not.
 * @return {void}
 */
var sendRequest = function sendRequest(instance, modifiedUri, requestedUri, pushState) {
	// Load fail counter
	var failCount = 0;

	// An option sent for ajax
	var option = {
		// uri to load
		uri: modifiedUri,
		// success handler
		onload: function onload(response) {
			// Modify response if modifier exists
			var contents = instance._modifier.response ? instance._modifier.response(response) : response;

			// Rewrite container
			(0, _rewrite2.default)(instance, contents);

			// Push to history when
			// 1. current request is not first load and
			// 2. not the popstate request
			if (!!instance._previousUri && pushState) {
				window.history.pushState(requestedUri, null, requestedUri);
			}

			// Remember current uri.
			instance._previousUri = modifiedUri;

			(0, _dispatch2.default)(instance, 'loadcomplete', {
				response: contents
			});
		},

		// error handler
		onerror: function onerror(code, message) {
			// Increment fail count.
			failCount += 1;

			if (failCount < instance._retry) {
				// If retriable, show warning message to console and send request again.
				console.warn('pjax: failed to load :: (' + code + ') Retrying...(' + failCount + ')');

				(0, _ajax2.default)(option);
			} else {
				// If cannot retry, show error message to console and dispatch 'loaderror' event.
				console.error('pjax: failed to load :: (' + code + ') ' + message);

				(0, _dispatch2.default)(instance, 'loaderror', {
					code: code | 0,
					message: message
				});
			}
		}
	};

	(0, _ajax2.default)(option);
}; /**
    * @module internal
    */

exports.default = sendRequest;
