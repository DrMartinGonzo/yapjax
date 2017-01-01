(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Yapjax = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _listen = require('./internal/listen');

var _listen2 = _interopRequireDefault(_listen);

var _loadUri = require('./internal/load-uri');

var _loadUri2 = _interopRequireDefault(_loadUri);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module main
 */

var DEFAULT_RETRY = 3;
var DEFAULT_TIMEOUT = 30000;

/**
 * Create yapjax instance.
 * @class
 */
var Yapjax = function Yapjax(options) {
	var _this = this;

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
	this._container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;

	/**
  * A selector for links to append load event.
  * @private
  */
	this._target = options.target || 'a[data-pjax]';

	/**
  * Retry count.
  * @private
  */
	this._retry = options.retry !== undefined ? options.retry | 0 : DEFAULT_RETRY;

	/**
  * [Not used] Loading timeout value.
  * @private
  */
	this._timeout = options.timeout !== undefined ? options.timeout | 0 : DEFAULT_TIMEOUT;

	/**
  * Loading delay or async dispatcher.
  * @private
  */
	this._delay = typeof options.delay === 'function' ? options.delay : options.delay !== undefined ? options.delay | 0 : 0;

	// Listen events and create detacher

	var detacher = (0, _listen2.default)(this);

	// Create destructor

	/**
  * Detach events and deref props.
  * @return {void}
  */
	this.destructor = function () {
		detacher();

		_this._container = void 0;

		_this._hook = void 0;
	};
};

Yapjax.prototype = {
	/**
  * Set timeout.
  * @param {number} ms - milliseconds to timeout.
  * @return {Yapjax} instance.
  */

	timeout: function timeout(ms) {
		this._timeout = ms | 0;

		return this;
	},


	/**
  * Set retry count.
  * @param {number} count - Count to retry.
  * @return {Yapjax} instance.
  */
	retry: function retry(count) {
		this._retry = count | 0;

		return this;
	},


	/**
  * Set delay for loading.
  * @param {number} value - milliseconds delay to load.
  * @param {function} value - function that dispatch send request.
  * @return {Yapjax} instance.
  */
	delay: function delay(value) {
		this._delay = typeof value === 'function' ? value : value | 0;

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
	modify: function modify(modifier) {
		var _this2 = this;

		Object.keys(modifier).forEach(function (target) {
			_this2._modifier[target] = modifier[target];
		});

		return this;
	},


	/**
  * Set event handler.
  * @param {string} event - event to listen.
  * @param {function} handler - handler when event was dispatch.
  * @return {Yapjax} instance.
  */
	on: function on(event, handler) {
		var eventName = event.toLowerCase();

		this._hook[eventName] = handler;

		return this;
	},


	/**
  * Load uri.
  * @param {string} uri - uri to load.
  * @return {void}
  */
	load: function load(uri) {
		(0, _loadUri2.default)(this, uri || window.location.pathname, true);
	}
};

module.exports = Yapjax;

},{"./internal/listen":4,"./internal/load-uri":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
var handler = function handler(instance, ev) {
  var href = ev.currentTarget.getAttribute('href');

  if (href) {
    ev.preventDefault();

    instance.load(href);

    return true;
  }
  return false;
};

exports.default = handler;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * @module internal
 */

/**
 * Dispatch pjax event.
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} event - event name to dispatch.
 * @param {object} payload - data passed to event handler.
 * @return {object} payload, or returns of handler.
 */
var dispatch = function dispatch(instance, event, payload) {
	var eventName = event.toLowerCase();

	// Dispatch pjax event on window.
	window.dispatchEvent(new Event("pjax:" + eventName));

	// If user hook event return the returned value of handler.
	if (eventName in instance._hook) {
		return instance._hook[eventName](payload);
	}

	// Return payload.
	return payload;
};

exports.default = dispatch;

},{}],4:[function(require,module,exports){
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

},{"../util/dom":9,"./click-handler":2,"./load-uri":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _dispatch = require('./dispatch');

var _dispatch2 = _interopRequireDefault(_dispatch);

var _sendRequest = require('./send-request');

var _sendRequest2 = _interopRequireDefault(_sendRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load uri.
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} uri - request uri.
 * @param {boolean} pushState - push uri to history or not.
 * @return {boolean} true:request sent, false:interrupted.
 */
/**
 * @module internal
 */

var loadUri = function loadUri(instance, uri, pushState) {
	// Variables for detecting cancel action.
	var cancel = false,
	    canceler = function canceler() {
		cancel = true;
	};

	(0, _dispatch2.default)(instance, 'beforeload', {
		uri: uri,
		cancel: canceler
	});

	// If canceler called, interrupt loading.
	if (cancel) {
		return false;
	}

	// Modify uri if modifier is set.
	var modifiedUri = instance._modifier.uri ? instance._modifier.uri(uri) : uri;

	// If requested uri is same to current uri, interrupt loading.
	if (modifiedUri === instance._previousUri) {
		return false;
	}

	(0, _dispatch2.default)(instance, 'loadstart', {
		uri: uri
	});

	// Bind parameters to sender function.
	var senderFn = function senderFn() {
		(0, _sendRequest2.default)(instance, modifiedUri, uri, pushState);
	};

	// Call sender function with delay
	if (typeof instance._delay === 'function') {
		instance._delay(senderFn);
	} else {
		window.setTimeout(senderFn, instance._delay);
	}

	return true;
};

exports.default = loadUri;

},{"./dispatch":3,"./send-request":7}],6:[function(require,module,exports){
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

	instance._container.scrollTop = 0;

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

},{"../util/dom":9,"./click-handler":2,"uid":10}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ajax = require('../util/ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var _rewrite = require('./rewrite');

var _rewrite2 = _interopRequireDefault(_rewrite);

var _dispatch = require('./dispatch');

var _dispatch2 = _interopRequireDefault(_dispatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Send request (dispatched after delay).
 * @param {Yapjax} instance - yapjax instance.
 * @param {string} modifiedUri - uri to request (actual uri).
 * @param {string} requestedUri - uri that user requested (shown in location bar).
 * @param {boolean} pushState - pushes to history or not.
 * @return {void}
 */
var sendRequest = function sendRequest(instance, modifiedUri, requestedUri, pushState) {
	// Load fail counter
	var failCount = 0;

	// An option sent for ajax
	var option = {
		// uri to load
		uri: modifiedUri,
		// success handler
		onload: function onload(response) {
			// Modify response if modifier exists
			var contents = instance._modifier.response ? instance._modifier.response(response) : response;

			// Rewrite container
			(0, _rewrite2.default)(instance, contents);

			// Push to history when
			// 1. current request is not first load and
			// 2. not the popstate request
			if (!!instance._previousUri && pushState) {
				window.history.pushState(requestedUri, null, requestedUri);
			}

			// Remember current uri.
			instance._previousUri = modifiedUri;

			(0, _dispatch2.default)(instance, 'loadcomplete', {
				response: contents
			});
		},

		// error handler
		onerror: function onerror(code, message) {
			// Increment fail count.
			failCount += 1;

			if (failCount < instance._retry) {
				// If retriable, show warning message to console and send request again.
				console.warn('pjax: failed to load :: (' + code + ') Retrying...(' + failCount + ')');

				(0, _ajax2.default)(option);
			} else {
				// If cannot retry, show error message to console and dispatch 'loaderror' event.
				console.error('pjax: failed to load :: (' + code + ') ' + message);

				(0, _dispatch2.default)(instance, 'loaderror', {
					code: code | 0,
					message: message
				});
			}
		}
	};

	(0, _ajax2.default)(option);
}; /**
    * @module internal
    */

exports.default = sendRequest;

},{"../util/ajax":8,"./dispatch":3,"./rewrite":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
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
var ajax = function ajax(_ref) {
	var uri = _ref.uri;
	var onload = _ref.onload;
	var onerror = _ref.onerror;

	var xhr = new XMLHttpRequest();

	xhr.open('GET', uri, true);

	xhr.responseType = 'text';

	xhr.addEventListener('load', function (e) {
		if (xhr.readyState === 4) {
			if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
				onload(xhr.responseText);
			} else {
				onerror(xhr.status, xhr.statusText);
			}
		}
	});

	xhr.setRequestHeader('X-PJAX', 'yapjax');

	xhr.addEventListener('error', function (e) {
		onerror(-1, xhr.statusText);
	});

	xhr.send(null);
};

exports.default = ajax;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
var select = function select(container, selector) {
  return Array.prototype.slice.call((container || document).querySelectorAll(selector));
};

exports.default = {
  select: select
};

},{}],10:[function(require,module,exports){
/**
 * Export `uid`
 */

module.exports = uid;

/**
 * Create a `uid`
 *
 * @param {String} len
 * @return {String} uid
 */

function uid(len) {
  len = len || 7;
  return Math.random().toString(35).substr(2, len);
}

},{}]},{},[1])(1)
});