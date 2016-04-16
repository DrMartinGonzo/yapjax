/* module: index (main) */

import jsdom from 'jsdom-global';

import { expect } from 'chai';

import Yapjax from '../src/';

describe('index', () => {
	describe('Yapjax', () => {
		describe('#constructor', () => {
			beforeEach(function() {
				this.jsdom = jsdom();
			});
			afterEach(function() {
				this.jsdom();
			});
			it('should creates instance', () => {
				let y = new Yapjax({});
				expect(y).to.be.instanceof(Yapjax);
			});
			it('should creates instance as if called as function', () => {
				let y = Yapjax({});
				expect(y).to.be.instanceof(Yapjax);
			});
			it('should get container element if typeof container == "string"', () => {
				let container = document.createElement('div');
				container.id = 'container';
				document.body.appendChild(container);

				let y = Yapjax({
					container: '#container'
				});
				expect(y._container).to.equal(container);
			});
			it('should sets retry.', () => {
				let y = Yapjax({
					retry: 5
				});
				expect(y._retry).to.equal(5);
			});
			it('should sets timeout.', () => {
				let y = Yapjax({
					timeout: 777
				});
				expect(y._timeout).to.equal(777);
			});
			it('should sets delay.', () => {
				let y = Yapjax({
					delay: 90
				});
				expect(y._delay).to.equal(90);
			});
			it('should sets delay if it was a function.',()=>{
				let f = (start)=>{};
				let y = Yapjax({
					delay: f
				});
				expect(y._delay).to.equal(f);
			});
		});
		describe('#timeout', () => {
			beforeEach(function() {
				this.jsdom = jsdom();
			});
			afterEach(function() {
				this.jsdom();
			});
			it('should sets timeout', () => {
				let y = Yapjax({});
				y.timeout(50);
				expect(y._timeout).to.equal(50);
			});
			it('should cast to i32.', () => {
				let y = Yapjax({});
				y.timeout(34.5);
				expect(y._timeout).to.equal(34);
			});
		});
		describe('#retry',()=>{
			beforeEach(function() {
				this.jsdom = jsdom();
			});
			afterEach(function() {
				this.jsdom();
			});
			it('should sets retry.',()=>{
				let y = Yapjax({});
				y.retry(10);
				expect(y._retry).to.equal(10);
			});
			it('should cast to i32.',()=>{
				let y = Yapjax({});
				y.retry('4.3');
				expect(y._retry).to.equal(4);
			});
		});
		describe('#delay',()=>{
			beforeEach(function() {
				this.jsdom = jsdom();
			});
			afterEach(function() {
				this.jsdom();
			});
			it('should sets delay time if non-function was passed.',()=>{
				let y = Yapjax({});
				y.delay(60);
				expect(y._delay).to.equal(60);
			});
			it('should sets load start function if function was passed.',()=>{
				let y = Yapjax({});
				let f = (start)=>{};
				y.delay(f);
				expect(y._delay).to.equal(f);
			});
			it('should cast value to i32 unless parameter is function.',()=>{
				let y = Yapjax({});
				y.delay('209.87');
				expect(y._delay).to.equal(209);
			});
		});
		describe('#modify',()=>{
			beforeEach(function() {
				this.jsdom = jsdom();
			});
			afterEach(function() {
				this.jsdom();
			});
			it('should sets modifier.',()=>{
				let y = Yapjax({});
				y.modify({
					uri: ()=>{},
					title: ()=>{},
					response: ()=>{}
				});
				expect(y._modifier).to.have.property('uri').that.is.a('function');
				expect(y._modifier).to.have.property('title').that.is.a('function');
				expect(y._modifier).to.have.property('response').that.is.a('function');
			});
		});
		describe('#on',()=>{
			beforeEach(function() {
				this.jsdom = jsdom();
			});
			afterEach(function() {
				this.jsdom();
			});
			it('should sets event hook.',()=>{
				let y = Yapjax({});
				y.on('beforeload',()=>{
				});
				y.on('LoAdStArT',()=>{
				});
				expect(y._hook).to.have.property('beforeload').that.is.a('function');
				expect(y._hook).to.have.property('loadstart').that.is.a('function');
			});
		});
		describe('#destructor', () => {
			beforeEach(function() {
				this.jsdom = jsdom();
			});
			afterEach(function() {
				this.jsdom();
			});
			it('should clear props.',()=>{
				let y = Yapjax({
					container: {}
				});
				y.on('testEvent',()=>{});
				expect(y._container).to.be.ok;
				expect(y._hook).to.be.ok;

				y.destructor();
				expect(y._container).to.be.undefined;
				expect(y._hook).to.be.undefined;
			});
		});
		describe('#load',()=>{
			beforeEach(function() {
				this.jsdom = jsdom();
			});
			afterEach(function() {
				this.jsdom();
			});
			it('should dispatch loadUri.',(done)=>{
				let y = Yapjax({});
				y.on('loadstart',({uri})=>{
					expect(uri).to.equal('hoge');
					done();
				});
				y.load('hoge');
			});
			it('should load location.pathname if no parameters selected.',(done)=>{
				let y = Yapjax({});
				y.on('loadstart',({uri})=>{
					expect(uri).to.equal(window.location.pathname);
					done();
				});
				y.load();
			});
		});
	});
});
