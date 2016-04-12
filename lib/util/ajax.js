'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * @module util
 */

/**
 * Ajax
 * @param {object} options - ajax options.
 * @param {string} options.uri - uri
 * @param {function} options.onload - success event handler
 * @param {function} options.onerror - error event handler
 * @return {void}
 */
var ajax = function ajax(_ref) {
	var uri = _ref.uri;
	var onload = _ref.onload;
	var onerror = _ref.onerror;

	var xhr = new XMLHttpRequest();

	xhr.open('GET', uri, true);

	xhr.responseType = 'text';

	xhr.addEventListener('load', function (e) {
		if (xhr.readyState === 4) {
			if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
				onload(xhr.responseText);
			} else {
				onerror(xhr.status, xhr.statusText);
			}
		}
	});

	xhr.setRequestHeader('X-PJAX', 'yapjax');

	xhr.addEventListener('error', function (e) {
		onerror(-1, xhr.statusText);
	});

	xhr.send(null);
};

exports.default = ajax;
