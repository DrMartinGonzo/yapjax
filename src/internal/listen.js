/**
 * @module internal
 */

import loadUri from './load-uri';

import dom from '../util/dom';

/**
 * Listen events and returns detacher.
 *
 * @param {Yapjax} instance - yapjax instance.
 * @return {function} function detaches event listener.
 */
let listen = (instance) => {

	// listen click event of target element
	let clickHandler = ev => {
		let target = ev.currentTarget;
		let href = target.getAttribute('href');

		if (href){
			ev.preventDefault();

			instance.load(href);
		}
	};

	dom.select(null, instance._target).forEach(el => {
		el.addEventListener('click', clickHandler);
	});

	// observes DOM tree and attaches handler to node matchs the query
	let mutationHandler = (records, observer) => {
		records.forEach(record => {
			if (record.type !== 'childList'){
				return
			}

			if (record.addedNodes.length > 0){
				Array.prototype.slice.call(record.addedNodes, 0).forEach(node => {
					if (typeof node.getAttribute === 'function'){
						if (node.getAttribute('href') && dom.select(node.parentNode, instance._target).some(child => child === node)){
							node.addEventListener('click', clickHandler);
						}

						if (node.children.length > 0){
							dom.select(node, instance._target).forEach(node => {
								node.addEventListener('click', clickHandler);
							});
						}
					}
				});
			}
		});
	};

	let observer = new MutationObserver(mutationHandler);

	observer.observe(document, {
		childList: true,
		subtree: true
	});

	// listen popstate event of window
	let popstateHandler = ev => {
		loadUri(instance, window.location.pathname, false);
	};

	window.addEventListener('popstate', popstateHandler);

	// return function that detaches event listeners
	return () => {
		dom.select(null, instance._target).forEach(el => {
			el.removeEventListener('click', clickHandler);
		});

		observer.disconnect();

		window.removeEventListener('popstate', popstateHandler);
	};
};

export default listen;
