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
let ajax = ({uri, onload, onerror}) => {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', uri, true);

	xhr.responseType = 'text';

	xhr.addEventListener('load', (e) => {
		if (xhr.readyState === 4) {
			if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
				onload(xhr);
			} else {
				onerror(xhr.status, xhr.statusText);
			}
		}
	});

	xhr.setRequestHeader('X-PJAX', 'yapjax');

	xhr.addEventListener('error', (e) => {
		onerror(-1, xhr.statusText);
	});

	xhr.send(null);
};

export default ajax;
