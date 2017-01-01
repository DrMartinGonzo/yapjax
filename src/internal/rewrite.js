/**
 * @module internal
 */

import uid from 'uid';

import dom from '../util/dom';

import clickHandler from './click-handler';

/**
 * Rewrite container html.
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} contents - html string to write to container.
 * @return {void}
 */
let rewrite = (instance, contents) => {
	let head = document.head;

	// Cleanup <script>s and <link>s appended by pjax

	if (instance._resources.length) {
		instance._resources.forEach(pjaxKey => {
			let el = head.querySelector(`[pjax-key="${ pjaxKey }"]`);

			el.disabled = true;
			el.parentNode.removeChild(el);
			el = undefined;
		});
		instance._resources.length = 0;
	}


	// Rewrite innerHTML

	instance._container.innerHTML = contents;

	instance._container.scrollTop = 0;

	// Add pjax hook

	dom.select(instance._container, instance._target).forEach(node => {
		node.addEventListener('click', ev => {
			clickHandler(instance, ev);
		});
	});

	// Get title and apply it

	let titles = dom.select(instance._container, 'title'),
		title = (titles[titles.length - 1] || {}).innerHTML;

	document.title = instance._modifier.title
		? instance._modifier.title(title)
		: title;

	// Get script and css and moves them to <head> to execute or apply

	let styles = dom.select(instance._container, 'link[href]');

	let scripts = dom.select(instance._container, 'script[src]');

	styles.concat(scripts).forEach(node => {
		// Create unique key.
		let pjaxKey = uid();

		instance._resources.push(pjaxKey);

		// Create node to be inserted.
		let newNode = document.createElement(node.tagName);

		newNode.setAttribute('pjax-key', pjaxKey);

		// Copy attribute to new node.
		let attrs = ['src', 'href', 'type', 'rel', 'className'];

		attrs.forEach(attr => {
			newNode[attr] = node[attr];
		});

		// Append new node.
		head.appendChild(newNode);

		// Remove old one.
		node.disbled = true;
		node.parentNode.removeChild(node);
	});

};

export default rewrite;
