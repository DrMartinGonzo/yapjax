/* module: internal */

import jsdom from 'jsdom-global';

import { expect } from 'chai';

import sinon from 'sinon';

import dispatch from '../src/internal/dispatch';
import listen from '../src/internal/listen';
import loadUri from '../src/internal/load-uri';
import sendRequest from '../src/internal/send-request';
import rewrite from '../src/internal/rewrite';

describe('internal', () => {
	beforeEach(function() {
		this.jsdom = jsdom();
	});

	afterEach(function() {
		this.jsdom();
	});

	describe('dispatch', () => {
		let createMock = (done) => {
			return {
				_hook: {
					testevent: done
				}
			};
		};
		it('calls event listener under the _hook', (done) => {
			let testPayload = 5;
			let mock = createMock((payload) => {
				expect(payload).to.equal(testPayload);
				done();
			});
			dispatch(mock, 'testevent', testPayload);
		});
		it('returns payload if instance does not listen the event', () => {
			let testPayload = 'foo';
			let mock = createMock((payload) => {
				throw new Error('Should not called.');
			});
			expect(dispatch(mock, 'fooevent', testPayload)).to.equal(testPayload);
		});
		it('calls event if event name contains upper case', (done) => {
			let testPayload = [1, 3];
			let mock = createMock((payload) => {
				expect(payload).to.deep.equal(testPayload);
				done();
			});
			dispatch(mock, 'TestEveNt', testPayload);
		});
		it('also dispatches custom pjax event on window', (done) => {
			let mock = createMock((payload) => {
			});
			window.addEventListener('pjax:testevent', (ev) => {
				done();
			});
			dispatch(mock, 'testEvent', {});
		});
	});

	describe('listen', () => {
		beforeEach(function() {
			this.jsdom = jsdom();
		});
		afterEach(function() {
			this.jsdom();
		});
		let createMock = (done) => {
			return {
				load(uri) {
					done(uri);
				},
				_target: '[data-pjax]'
			};
		};
		it('calls Yapjax::load when event source has href value', (done) => {
			let a = document.createElement('a');
			let testUri = '/test/';
			let mock = createMock((uri) => {
				document.body.removeChild(a);
				expect(uri).to.equal(testUri);
				done();
			});

			document.body.appendChild(a);

			a.setAttribute('data-pjax', true);
			a.href = testUri;

			listen(mock);

			a.click();
		});
		it('works even if target was not `a` element', (done) => {
			let span = document.createElement('span');
			let testUri = '/test/';
			let mock = createMock((uri) => {
				document.body.removeChild(span);
				expect(uri).to.equal(testUri);
				done();
			});

			document.body.appendChild(span);

			span.setAttribute('data-pjax', true);
			span.setAttribute('href', testUri);

			listen(mock);

			span.click();
		});
		it('should works even if clicked anchor\'s children.', (done) => {
			let anchor = document.createElement('a');

			const testUri = '/children-test/';

			const mock = createMock(uri => {
				document.body.removeChild(anchor);
				expect(uri).to.equal(testUri);
				done()
			});

			anchor.href = testUri;

			let span = document.createElement('span');

			span.innerHTML = 'foo';

			anchor.appendChild(span);

			document.body.appendChild(anchor);

			listen(mock);

			span.click();
		});
		it('should not do anything if element that has no href value was passed', (done) => {
			let a = document.createElement('a');
			let testUri = '/test/';
			let mock = createMock((uri) => {
				done(new Error('Should not called.'));
			});
			document.body.appendChild(a);

			a.setAttribute('data-pjax', true);
			a.addEventListener('click', (ev) => {
				setTimeout(() => {
					done()
				}, 100)
			});

			listen(mock);

			a.click();
		});
		it('should sets handler to element matches to selector', (done) => {
			let testUri = '/test/';
			let mock = createMock((uri) => {
				expect(uri).to.equal(testUri);
				done();
			});
			let a = document.createElement('a');
			document.body.appendChild(a);
			a.href = testUri;
			a.setAttribute('data-pjax', true);
			listen(mock);

			a.click();
		});
		it('should listen popstate event on window', (done) => {
			let blank = 'about:blank',
				config = 'about:config';
			let mock = {
				_hook: {
					beforeload: ({uri, cancel}) => {
						expect(uri).to.equal('config');
						cancel();
						done();
					}
				},
				_target: 'a[data-pjax]'
			};
			listen(mock);

			window.location.href = blank;
			window.history.pushState(config, null, config);
			window.history.pushState(blank, null, blank);

			window.history.back();
		});
		it('should return destructor', (done) => {
			let mock = {
				_hook: {
					beforeload: ({uri, cancel}) => {
						cancel();
						done(new Error('Should not called.'));
					}
				},
				_target: 'a[data-pjax]',
				load(uri) {
					done(new Error('Should not called'));
				}
			};
			let blank = 'about:blank',
				config = 'about:config';
			window.location.href = blank;
			window.history.pushState(config, null, config);
			window.history.pushState(blank, null, blank);

			let a = document.createElement('a');
			document.body.appendChild(a);
			a.setAttribute('data-pjax', true);
			a.href = 'about:config';

			listen(mock)();

			a.click();
			window.history.back();

			setTimeout(() => {
				done();
			}, 10);
		});
	});

	describe('load-uri', () => {
		let mock, xhr, requests;
		beforeEach(function() {
			xhr = global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
			requests = this.requests = [];

			xhr.onCreate = function(xhr) {
				requests.push(xhr);
			};
			mock = {
				_modifier: {},
				_previousUri: null,
				_delay: 5,
				_hook: {
				}
			};
		});
		afterEach(() => {
			xhr.restore();
		});

		it('cancels if beforeload event call `cancel`.', () => {
			mock._hook.beforeload = ({uri, cancel}) => {
				cancel();
			};

			expect(loadUri(mock, '/test/', true)).to.be.false;
		});
		it('cancels if current uri is same to previous uri.', () => {
			mock._previousUri = '/test/';

			expect(loadUri(mock, '/test/', true)).to.be.false;
		});
		it('modifier should modify uri.', () => {
			let uri = '/foo';
			mock._previousUri = uri;
			mock._modifier.uri = () => uri;

			expect(loadUri(mock, '/test/', true)).to.be.false;
		});
		it('should dispatch loadstart event', (done) => {
			let uri = '/foo';
			mock._hook.loadstart = (data) => {
				expect(data.uri).to.equal(uri);
				done();
			}
			loadUri(mock, uri, false);
		});
		it('should send request', (done) => {
			let uri = '/foo';
			loadUri(mock, uri, false);
			setTimeout(() => {
				expect(requests[0].url).to.equal(uri);
				done();
			}, 10);
		});
		it('should send request when handler is called', (done) => {
			let uri = '/bar';
			mock._delay = (start) => {
				start();
				expect(requests[0].url).to.equal(uri);
				done();
			};
			loadUri(mock, uri, false);
		});
	});

	describe('send-request', () => {
		let mock, requests, xhr;
		let response = (code, html, index) => {
			requests[index !== undefined ? index : requests.length - 1].respond(code, {
				'Content-Type': 'text/html'
			}, html);
		};
		beforeEach(function() {
			xhr = global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
			requests = this.requests = [];

			xhr.onCreate = function(xhr) {
				requests.push(xhr);
			};
			mock = {
				_retry: 0,
				_modifier: {
				},
				_hook: {
				},
				_resources: [],
				_container: {
					innerHTML: '',
					querySelectorAll: () => {
						return [];
					}
				},
				_target: 'a[data-pjax]'
			};
		});
		afterEach(() => {
			xhr.restore();
		});
		it('sends request', function(done) {
			let uri = '/index.html';
			mock._hook.loadcomplete = ({response}) => {
				expect(mock._previousUri).to.equal(uri);
				done();
			};
			sendRequest(mock, uri, uri, false);
			expect(requests[0].method).to.equal('GET');
			expect(requests[0].url).to.equal(uri);
			expect(requests[0].requestHeaders).to.have.property('X-PJAX');
			response(200, '<p>Hello, World!</p>');
		});
		it('retry if _retry > 0', (done) => {
			let uri = '/foo.html';
			mock._retry = 3;
			mock._hook.loaderror = ({code, message}) => {
				expect(code).to.equal(404);
				expect(requests.length).to.equal(3);
				done();
			};
			sendRequest(mock, uri, uri, false);
			response(404, '<p>Not found</p>', 0);
			response(404, '<p>Not found</p>', 1);
			response(404, '<p>Not found</p>', 2);
		});
		it('response modifier works', (done) => {
			let modified = 'foo12345';
			let uri = '/bar.html';
			mock._modifier.response = (res) => modified;
			mock._hook.loadcomplete = ({response}) => {
				expect(response).to.equal(modified);
				done();
			};

			sendRequest(mock, uri, uri, false);
			response(200, '<p></p>');
		});
		it('push history when pushState=true and _previousUri is set', (done) => {
			let uri = 'about:config';
			mock._previousUri = 'about:blank';
			mock._hook.loadcomplete = ({response}) => {
				expect(window.location.href).to.equal(uri);
				done();
			};
			sendRequest(mock, uri, uri, true);
			response(200, '<p></p>');
		});
		it('does not push history when pushState is set but _previousUri is null', (done) => {
			let uri = 'about:config';
			mock._hook.loadcomplete = ({response}) => {
				expect(window.location.href).not.to.equal(uri);
				done();
			};
			sendRequest(mock, uri, uri, true);
			response(200, '<p></p>');
		});
	});

	describe('rewrite', () => {
		let container, mock;
		beforeEach(() => {
			container = document.createElement('div');

			document.body.appendChild(container);
			mock = {
				_resources: [],
				_container: container,
				_target: 'a[data-pjax]',
				_modifier: {
				}
			};
		});
		afterEach(() => {
			document.body.removeChild(container);
		});
		it('writes html to container', () => {
			let html = '<p>Hello, World !</p>';
			rewrite(mock, html);
			expect(mock._container.innerHTML).to.equal(html);
		});
		it('sets title', () => {
			let html = '<title>foo</title>';
			mock._modifier.title = (title) => {
				return '[' + title + ']';
			};
			rewrite(mock, html);
			expect(document.title).to.equal('[foo]');
		});
		it('sets click handler', (done) => {
			let html = '<a data-pjax href="bar">foo</a>';
			mock.load = (uri) => {
				expect(uri).to.equal('bar');
				done();
			};
			rewrite(mock, html);
			mock._container.querySelector('a[data-pjax]').click();
		});
		it('sets scripts and stylesheet to head', () => {
			let html = '<script src=""></script><link rel="stylesheet" href=""/>';
			rewrite(mock, html);
			expect(mock._resources).to.have.length(2);
			expect(document.head.querySelectorAll('[pjax-key]').length).to.equal(2);
		});
		it('removes previous script', () => {
			let html = '<script src=""></script><link href=""/>';
			rewrite(mock, html);
			rewrite(mock, '');
			expect(mock._resources).to.have.length(0);
			expect(document.head.querySelectorAll('[pjax-key]').length).to.equal(0);
		});
	});
});
