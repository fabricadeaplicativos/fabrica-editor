// native
var path = require('path'),
	fs   = require('fs');

// external modules
var htmlparser2 = require('htmlparser2'),
    DomHandler  = require('domhandler'),
    DomUtils    = require('domutils'),
    _           = require('lodash');



// Creates a parser function to be used.
// The returned parser takes an html string and returns the marked-html.
// 
// SEE:
// https://github.com/fb55/htmlparser2/blob/master/lib/index.js#L39-L43 
function createDomBuilder(options) {

	// get some values
	var fname = options.fname;

	/**
	 * getNodeXPath Retrieves the node xPath
	 * @param  {[type]} node [description]
	 * @return {[type]}      [description]
	 */
	function getNodeXPath(node) {

		var paths = [];

		for (; node && node.type === 'tag'; node = node.parent) {
			var index = 0;

			for (var sibling = node.prev; sibling; sibling = sibling.prev) {
				if (sibling.type !== 'tag') {
					continue;
				} else if (sibling.name === node.name) {
					++index
				}
			}

			var pathIndex = (index ? "[" + (index+1) + "]" : "");
			paths.splice(0, 0, node.name + pathIndex);
		}

		return paths.length ? "/" + paths.join("/") : null;
	}

	// function that adds attributes to the element
	// xpath and file name
	function elementCB(element) {
		// xpath
		element.attribs[options.xPathAttribute] = getNodeXPath(element);
		// file name
		element.attribs[options.fnameAttribute] = fname;

		// startIndex
		element.attribs[options.startIndexAttribute] = element.startIndex;

		// endIndex
		element.attribs[options.endIndexAttribute] = element.endIndex;
	}



	// return function that does parsing
	// 
	// SEE:
	// https://github.com/fb55/htmlparser2/blob/master/lib/index.js#L39-L43
	return function (html) {

		// create new handler
		var handler = new DomHandler({
			withStartIndices: true,
			withEndIndices: true
		}, elementCB);

		// create parser usign the newly created handler
		var parser = new htmlparser2.Parser(handler);

		// insert the data into the parser
		parser.end(html);

		// return the dom, which is a property of the handler
		return handler.dom;
	};
}


// exports

/**
 * Builds a marked DOM
 * @param  {[type]} html    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
exports.buildMarkedDom = function (html, options) {
	// set default options
	_.defaults(options, {
		xPathAttribute: 'data-x-path',
		fnameAttribute: 'data-fname',
		startIndexAttribute: 'data-start-index',
		endIndexAttribute: 'data-end-index',
	});

	// create domBuilder
	var domBuilder = createDomBuilder(options);

	return domBuilder(html);
};

// simply export domutils stuff
exports.find = DomUtils.find;
exports.findAll = DomUtils.findAll;