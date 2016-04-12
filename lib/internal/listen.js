'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _clickHandler = require('./click-handler');

var _clickHandler2 = _interopRequireDefault(_clickHandler);

var _loadUri = require('./load-uri');

var _loadUri2 = _interopRequireDefault(_loadUri);

var _dom = require('../util/dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Listen events and returns detacher.
 *
 * @param {Yapjax} instance - yapjax instance.
 * @return {function} function detaches event listener.
 */
var listen = function listen(instance) {

	// listen click event of target element
	var targetHandler = function targetHandler(ev) {
		(0, _clickHandler2.default)(instance, ev);
	};

	_dom2.default.select(null, instance._target).forEach(function (el) {
		el.addEventListener('click', targetHandler);
	});

	// listen popstate event of window
	var popstateHandler = function popstateHandler(ev) {
		(0, _loadUri2.default)(instance, window.location.pathname, false);
	};

	window.addEventListener('popstate', popstateHandler);

	// return function that detaches event listeners
	return function () {
		_dom2.default.select(null, instance._target).forEach(function (el) {
			el.removeEventListener('click', targetHandler);
		});

		window.removeEventListener('popstate', popstateHandler);
	};
}; /**
    * @module internal
    */

exports.default = listen;
