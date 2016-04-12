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
