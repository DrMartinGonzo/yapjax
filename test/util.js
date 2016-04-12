/* module: util */

import jsdom from 'jsdom-global';

import { expect } from 'chai';

import sinon from 'sinon';

import dom from '../src/util/dom';
import ajax from '../src/util/ajax';

describe('util', () => {
	beforeEach(function() {
		this.jsdom = jsdom();
	});

	afterEach(function() {
		this.jsdom();
	});

	describe('dom', () => {
		describe('select', () => {
			it('returns Array<Node>', () => {
				let div = document.createElement('div');
				div.innerHTML = '<a class="pjax"></a><a data-pjax></a><a data-pjax></a>';
				document.body.appendChild(div);
				let nodes = dom.select(document, 'a[data-pjax]');

				expect(nodes).to.be.instanceof(Array);
				expect(nodes).to.have.length(2);

				document.body.removeChild(div);
			});
		});
	});

	describe('ajax', () => {
		let xhr, requests;
		beforeEach(function() {
			xhr = global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
			requests = this.requests = [];

			xhr.onCreate = (xhr) => {
				requests.push(xhr);
			};
		});
		afterEach(function() {
			xhr.restore();
		});
		it('should sends request and execute onload when success', () => {
			let uri = '/foo';
			let spy = sinon.spy();
			let option = {
				uri: uri,
				onerror(code, message) {
					throw new Error('Should not called');
				},
				onload: spy
			};
			ajax(option);
			ajax(option);
			ajax(option);
			expect(requests[0].url).to.equal(uri);
			expect(requests[0].method).to.equal('GET');
			expect(requests[0].requestHeaders).to.have.property('X-PJAX');
			expect(requests[0].responseType).to.equal('text');
			requests[0].respond(200, {}, '');
			requests[1].respond(304, {}, '');
			requests[2].respond(206, {}, '');

			expect(spy.callCount).to.equal(3);
		});
		it('should call onerror when server returns not 200', () => {
			let spy = sinon.spy();
			let option = {
				uri: '/bar',
				onerror: spy,
				onload() {
					throw new Error('Should not called');
				}
			};
			ajax(option);
			ajax(option);
			ajax(option);

			requests[0].respond(301, {}, '');
			requests[1].respond(404, {}, '');
			requests[2].respond(500, {}, '');

			expect(spy.callCount).to.equal(3);
		});
		it('should call onerror when xhr error has occurred.', function(done) {
			this.timeout(10000);
			global.XMLHttpRequest = window.XMLHttpRequest;

			let option = {
				uri: 'http://aajjijbc123avcpapojrdpojapoj.asodjpaos',
				onerror(code) {
					expect(code).to.equal(-1);
					done();
				},
				onload() {
					done(new Error('Should not be called'));
				}
			};
			ajax(option);
		});
	});

});
