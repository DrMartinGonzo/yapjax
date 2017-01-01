'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

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
/**
 * @module internal
 */

var listen = function listen(instance) {

	// listen click event of target element
	var clickHandler = function clickHandler(ev) {
		var target = ev.currentTarget;
		var href = target.getAttribute('href');

		if (href) {
			ev.preventDefault();

			instance.load(href);
		}
	};

	_dom2.default.select(null, instance._target).forEach(function (el) {
		el.addEventListener('click', clickHandler);
	});

	// observes DOM tree and attaches handler to node matchs the query
	var mutationHandler = function mutationHandler(records, observer) {
		records.forEach(function (record) {
			if (record.type !== 'childList') {
				return;
			}

			if (record.addedNodes.length > 0) {
				Array.prototype.slice.call(record.addedNodes, 0).forEach(function (node) {
					if (typeof node.getAttribute === 'function') {
						if (node.getAttribute('href') && _dom2.default.select(node.parentNode, instance._target).some(function (child) {
							return child === node;
						})) {
							node.addEventListener('click', clickHandler);
						}

						if (node.children.length > 0) {
							_dom2.default.select(node, instance._target).forEach(function (node) {
								node.addEventListener('click', clickHandler);
							});
						}
					}
				});
			}
		});
	};

	var observer = new MutationObserver(mutationHandler);

	observer.observe(document, {
		childList: true,
		subtree: true
	});

	// listen popstate event of window
	var popstateHandler = function popstateHandler(ev) {
		(0, _loadUri2.default)(instance, window.location.pathname, false);
	};

	window.addEventListener('popstate', popstateHandler);

	// return function that detaches event listeners
	return function () {
		_dom2.default.select(null, instance._target).forEach(function (el) {
			el.removeEventListener('click', clickHandler);
		});

		observer.disconnect();

		window.removeEventListener('popstate', popstateHandler);
	};
};

exports.default = listen;
