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
