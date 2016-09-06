/**
 * @module internal
 */

/**
 * Click event listener
 *
 * @param {Yapjax} instance - yapjax instance
 * @param {Event} ev - click event
 * @return {boolean} return true if target element has 'href' value
 */
let handler = (instance, ev) => {
	let href = ev.currentTarget.getAttribute('href');

	if (href) {
		ev.preventDefault();

		instance.load(href);

		return true;
	}
	return false;
};

export default handler;
