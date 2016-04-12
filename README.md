# yapjax
-- Yet Another PJAX library --

yapjax is a library that enables changing page without fullpage-reload.
It's heavily inspired by [jquery-pjax](https://github.com/defunkt/jquery-pjax).

It's ...

+ standalone. You don't need to include jQuery.
+ works with browserify.
+ tiny (minified: 6.07kb, gziped: 2.05kb).

## Usage

```
npm install --save yapjax
```

## Example

Of course, these examples needs to be bundled by browserify, webpack or etc...

### Simple
```javascript
var pjax = require('yapjax');

pjax({
	container: '#pjax-container',
	target: 'a[data-pjax]'
}).load();
```

### Manipulating
With modifier, it's easy to manipulate uri, response data, and title.

```javascript
var pjax = require('yapjax');
var marked = require('marked'); // markdown parser

var layer = document.getElementById('layer');

var convertLink = function(html){
	return html
		.replace(
			/<a(\s.+\s|\s)href="(\/.*)"(\s.+|)>(.*)<\/a>/g,
			'<a $1 href="$2" $3 data-pjax>$4</a>'
		);
};

pjax({
	container: '#pjax-container',
	target: 'a[data-pjax]',
	delay: 200
}).on('loadstart',(data)=>{
	layer.classList.add('fade');
}).on('loadcomplete',(data)=>{
	layer.classList.remove('fade');
}).modify({
	uri:function(uri){
		return uri+'/page.md';
	},
	title:function(title){
		return title+' - my speedy site';
	},
	response:function(response){
		return convertLink(marked(response));
	}
}).load();
```

### Nesting

It's simple to nest.
You can call yapjax in chains via script located in pjax-loaded page.

In order to use this technique, you must configure your server to always return `/index.html` for request that does not have ext (like `/foo/bar` and `/hoge/fuga/piyo/`).

If your server running on node, using [pushstate-server](https://github.com/scottcorgan/pushstate-server) is all you need.

This way ignores legacy browser not supporting `pushState/popstate`.

```javascript
// [index.js]
var pjax = require('yapjax');

pjax({
	container: '#pjax-container-main',
	target: 'a[data-pjax]'
}).modify({
	uri:function(uri){
		// If uri starts with '/gallery',
		return uri.indexOf('/gallery')===0
			? '/gallery/sidemenu.html' // yapjax loads common parts of gellery
			: uri+'/page.html'; // otherwise load page normally
		}
}).load();
```

```html
<!-- [gallery/sidemenu.html] -->
<script type="text/javascript" src="/gallery/index.js"></script>
<link rel="stylesheet" href="/gallery/style.css"/>
<div class="gallery--sidemenu">
...
</div>
<div id="pjax-container-gallery">
</div>
```

```javascript
// [gallery/index.js]
var pjax = require('yapjax');

var gallery = pjax({
	container: '#pjax-container-gallery',
	target: 'a[data-pjax]'
});

gallery.on('beforeload',function(data){
	var uri = data.uri,
		cancel = data.cancel;

	// If uri does not contains '/gallery',
	if(!(uri.indexOf('/gallery') > -1)){
		// cancel loading and
		cancel();
		// detach handlers attached by gallery's yapjax.
		pjax.destructor();
	}
}).modify({
	uri: function(uri){
		return uri+'/page.html';
	}
}).load();
```

When requested `/gallery/some/picture`,

1. server returns `/index.html`
1. `/index.js` called
1. yapjax in `/index.js` recieves uri then loads `/gallery/sidemenu.html` (manipulated by modifer, see `uri` on `modify` method's argument).
1. server returns `/gallery/sidemenu.html`
1. write html to `<div id="pjax-container-main"></div>`
1. yapjax in `/index.js` execute script in `/gallery/sidemenu.html` (= `/gallery/index.js`)
1. `/gallery/index.js` called
1. yapjax in `/gallery/index.js` recieves `/gallery/some/picture`
1. yapjax in `/gallery/index.js` loads `/gallery/some/picture/page.html` and write it to `<div id="pjax-container-gallery></div>`


## Contribution

Always welcome !

+ If you find bug, typo or **grammatical** error (I'm not English speaker), please open an issue.
+ If you have feature request, please open an issue or send pull request.
