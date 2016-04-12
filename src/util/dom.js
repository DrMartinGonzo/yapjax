/**
 * DOM utilities.
 * @module dom
 */

/**
 * Returns an array elements matched for css selector.
 * @param {HTMLElement} container - find elements under this container.
 * @param {string} selector - css selector.
 * @return {Array<NodeList>} an array of nodes.
 */
let select = (container, selector) => {
	return Array.prototype.slice.call((container || document).querySelectorAll(selector));
};

export default {
	select
};
