'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _uid = require('uid');

var _uid2 = _interopRequireDefault(_uid);

var _dom = require('../util/dom');

var _dom2 = _interopRequireDefault(_dom);

var _clickHandler = require('./click-handler');

var _clickHandler2 = _interopRequireDefault(_clickHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Rewrite container html.
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} contents - html string to write to container.
 * @return {void}
 */
var rewrite = function rewrite(instance, contents) {
	var head = document.head;

	// Cleanup <script>s and <link>s appended by pjax

	if (instance._resources.length) {
		instance._resources.forEach(function (pjaxKey) {
			var el = head.querySelector('[pjax-key="' + pjaxKey + '"]');

			el.parentNode.removeChild(el);
			el = undefined;
		});
		instance._resources.length = 0;
	}

	// Rewrite innerHTML

	instance._container.innerHTML = contents;

	// Add pjax hook

	_dom2.default.select(instance._container, instance._target).forEach(function (node) {
		node.addEventListener('click', function (ev) {
			(0, _clickHandler2.default)(instance, ev);
		});
	});

	// Get title and apply it

	var titles = _dom2.default.select(instance._container, 'title'),
	    title = (titles[titles.length - 1] || {}).innerHTML;

	document.title = instance._modifier.title ? instance._modifier.title(title) : title;

	// Get script and css and moves them to <head> to execute or apply

	var styles = _dom2.default.select(instance._container, 'link[href]');

	var scripts = _dom2.default.select(instance._container, 'script[src]');

	styles.concat(scripts).forEach(function (node) {
		// Create unique key.
		var pjaxKey = (0, _uid2.default)();

		instance._resources.push(pjaxKey);

		// Create node to be inserted.
		var newNode = document.createElement(node.tagName);

		newNode.setAttribute('pjax-key', pjaxKey);

		// Copy attribute to new node.
		var attrs = ['src', 'href', 'type', 'rel', 'className'];

		attrs.forEach(function (attr) {
			newNode[attr] = node[attr];
		});

		// Append new node.
		head.appendChild(newNode);

		// Remove old one.
		node.parentNode.removeChild(node);
	});
}; /**
    * @module internal
    */

exports.default = rewrite;
