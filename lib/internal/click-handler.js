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
  var href = ev.target.getAttribute('href');
  if (href) {
    ev.preventDefault();

    instance.load(href);

    return true;
  }
  return false;
};

exports.default = handler;
