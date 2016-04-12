'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _dispatch = require('./dispatch');

var _dispatch2 = _interopRequireDefault(_dispatch);

var _sendRequest = require('./send-request');

var _sendRequest2 = _interopRequireDefault(_sendRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load uri.
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} uri - request uri.
 * @param {boolean} pushState - push uri to history or not.
 * @return {boolean} true:request sent, false:interrupted.
 */
/**
 * @module internal
 */

var loadUri = function loadUri(instance, uri, pushState) {
	// Variables for detecting cancel action.
	var cancel = false,
	    canceler = function canceler() {
		cancel = true;
	};

	(0, _dispatch2.default)(instance, 'beforeload', {
		uri: uri,
		cancel: canceler
	});

	// If canceler called, interrupt loading.
	if (cancel) {
		return false;
	}

	// Modify uri if modifier is set.
	var modifiedUri = instance._modifier.uri ? instance._modifier.uri(uri) : uri;

	// If requested uri is same to current uri, interrupt loading.
	if (modifiedUri === instance._previousUri) {
		return false;
	}

	(0, _dispatch2.default)(instance, 'loadstart', {
		uri: uri
	});

	// Bind parameters to sender function.
	var senderFn = function senderFn() {
		(0, _sendRequest2.default)(instance, modifiedUri, uri, pushState);
	};

	// Call sender function with delay
	if (typeof instance._delay === 'function') {
		instance._delay(senderFn);
	} else {
		window.setTimeout(senderFn, instance._delay);
	}

	return true;
};

exports.default = loadUri;
