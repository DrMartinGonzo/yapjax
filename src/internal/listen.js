/**
 * @module internal
 */

import clickHandler from './click-handler';

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
	let targetHandler = ev => {
		clickHandler(instance, ev);
	};

	dom.select(null, instance._target).forEach(el => {
		el.addEventListener('click', targetHandler);
	});

	// listen popstate event of window
	let popstateHandler = ev => {
		loadUri(instance, window.location.pathname, false);
	};

	window.addEventListener('popstate', popstateHandler);

	// return function that detaches event listeners
	return () => {
		dom.select(null, instance._target).forEach(el => {
			el.removeEventListener('click', targetHandler);
		});

		window.removeEventListener('popstate', popstateHandler);
	};
};

export default listen;
