/**
 * @module main
 */

import listen from './internal/listen';

import loadUri from './internal/load-uri';

const DEFAULT_RETRY = 3;
const DEFAULT_TIMEOUT = 30000;

/**
 * Create yapjax instance.
 * @class
 */
let Yapjax = function(options) {
	if (!(this instanceof Yapjax)) {
		return new Yapjax(options);
	}

	// Set properties

	/**
	 * Store previous uri.
	 * @private
	 */
	this._previousUri = null;

	/**
	 * Pjax event hook.
	 * @private
	 */
	this._hook = {};

	/**
	 * Unique key of resources added by pjax.
	 * @private
	 */
	this._resources = [];

	/**
	 * Modifiers.
	 * @private
	 */
	this._modifier = {};

	/**
	 * Container to be rewritten.
	 * @private
	 */
	this._container = (typeof options.container === 'string')
		? document.querySelector(options.container)
		: options.container;

	/**
	 * A selector for links to append load event.
	 * @private
	 */
	this._target = options.target || 'a[data-pjax]';

	/**
	 * Retry count.
	 * @private
	 */
	this._retry = (options.retry !== undefined)
		? (options.retry | 0)
		: DEFAULT_RETRY ;

	/**
	 * [Not used] Loading timeout value.
	 * @private
	 */
	this._timeout = (options.timeout !== undefined)
		? (options.timeout | 0)
		: DEFAULT_TIMEOUT;

	/**
	 * Loading delay or async dispatcher.
	 * @private
	 */
	this._delay = (typeof options.delay === 'function')
		? options.delay
		: (options.delay !== undefined)
			? (options.delay | 0)
			: 0;

	// Listen events and create detacher

	let detacher = listen(this);

	// Create destructor

	/**
	 * Detach events and deref props.
	 * @return {void}
	 */
	this.destructor = () => {
		detacher();

		this._container = void 0;

		this._hook = void 0;
	};
};

Yapjax.prototype = {
	/**
	 * Set timeout.
	 * @param {number} ms - milliseconds to timeout.
	 * @return {Yapjax} instance.
	 */
	timeout(ms) {
		this._timeout = (ms | 0);

		return this;
	},

	/**
	 * Set retry count.
	 * @param {number} count - Count to retry.
	 * @return {Yapjax} instance.
	 */
	retry(count) {
		this._retry = (count | 0);

		return this;
	},

	/**
	 * Set delay for loading.
	 * @param {number} value - milliseconds delay to load.
	 * @param {function} value - function that dispatch send request.
	 * @return {Yapjax} instance.
	 */
	delay(value) {
		this._delay = typeof value === 'function'
			? value
			: (value | 0);

		return this;
	},

	/**
	 * Set modifiers.
	 * @param {object} modifier - modifiers object.
	 * @param {function} modifier.uri - uri modifier.
	 * @param {function} modifier.title - title modifier.
	 * @param {function} modifier.response - response modifier.
	 * @return {Yapjax} instance.
	 */
	modify(modifier) {
		Object.keys(modifier).forEach((target) => {
			this._modifier[target] = modifier[target];
		});

		return this;
	},

	/**
	 * Set event handler.
	 * @param {string} event - event to listen.
	 * @param {function} handler - handler when event was dispatch.
	 * @return {Yapjax} instance.
	 */
	on(event, handler) {
		let eventName = event.toLowerCase();

		this._hook[eventName] = handler;

		return this;
	},

	/**
	 * Load uri.
	 * @param {string} uri - uri to load.
	 * @return {void}
	 */
	load(uri) {
		loadUri(this, uri || window.location.pathname, true);
	}
};

module.exports = Yapjax;
