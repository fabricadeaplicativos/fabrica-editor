// native
var path = require('path'),
	fs   = require('fs');

// third-party
var _     = require('lodash');
var	watch = require('watch');
var	DomFs = require('dom-fs');
var	q     = require('q');
var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');

// internal deps
var markedDomUtils = require('../../../_sub-applications/marked-dom-utils');


// CONSTANTS
var X_PATH_ATTRIBUTE      = 'data-x-path',
	FNAME_ATTRIBUTE       = 'data-fname',
	START_INDEX_ATTRIBUTE = 'data-start-index',
	END_INDEX_ATTRIBUTE   = 'data-end-index';

/**
 * Takes in a set of options to handle events on the socket.
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function configureOnConnection(options) {

	// create instance of projectDomFs.
	var projectDomFs = new DomFs(options.projectsDir);

	///////////////
	// AUXILIARY //
	
	// build full path from the file name
	function buildFullPathFromFname(fname) {
		return path.join(options.projectsDir, fname);
	}

	function buildDomFromFile(fname, callback) {

		var fullPath = buildFullPathFromFname(fname);

		// read asynchronously
		fs.readFile(fullPath, function (err, contents) {

			if (err) {
				callback(err);
			}


			// build the marked dom
			var markedDom = markedDomUtils.buildMarkedDom(contents, {
				fname: fname,
				xPathAttribute: X_PATH_ATTRIBUTE,
				fnameAttribute: FNAME_ATTRIBUTE,
				startIndexAttribute: START_INDEX_ATTRIBUTE,
				endIndexAttribute: END_INDEX_ATTRIBUTE
			});

			callback(null, markedDom);
		})
	}

	function writeDomToFile(fname, dom, callback) {
		// the path at which the file is
		var fullPath = buildFullPathFromFname(fname);

		// the html to be written
		var cleanHtml = markedDomUtils.stringify(dom, [X_PATH_ATTRIBUTE, FNAME_ATTRIBUTE, START_INDEX_ATTRIBUTE, END_INDEX_ATTRIBUTE]);

		// options for the writing operation
		var writeOptions = {
			encoding: 'utf8',
			mode: 777,
		};

		// do writing
		fs.writeFile(fullPath, cleanHtml, writeOptions, callback);
	}
	// AUXILIARY //
	///////////////

	// handles 'IDE:openHtml' events
	function onOpenHtml(socket, data) {

		console.log('IDE:openHtml')
		socket.broadcast.emit('IDE:openHtml', data);
	}

	function onOpenCss(socket, data) {

	}

	// EDITION
	function onEditAttribute(socket, data) {

		var file = projectDomFs.getFile(data.fname);

		
		file.getElementAtXPath(data.xPath)
			.then(function (element) {

				element.editAttribute(data.attribute, data.value);

			})
			.then(function () {
				
				return file.write();
			})
			.then(function () {

				onReload(socket);
				console.log('write successful');
			})
			.done();
	}

	// adds an element
	// element addition can only be an append,
	// due to the case in which the node is the topmost of the 
	// xpath hierarchy in the file.
	// 
	// thus, the addition must provide a parent element
	// and optionally provide an reference element, 
	// without which the addition will be done as an append to the parent
	// 
	// data: 
	// - fname (filename)
	// - xPath (xPath of the parent element)
	// - referenceElementXPath (xPath of the reference element)
	function onAddElement(socket, data) {

		// data = JSON.parse(data);

		console.log(data);

		// load file
		var file = projectDomFs.getFile(data.fname);

		// load parentElement
		var parentElementPromise = file.getElementAtXPath(data.xPath);

		// check if there is a reference element
		if (data.after) {
			// add after
			var referenceElementPromise = file.getElementAtXPath(data.after);

			q.all([parentElementPromise, referenceElementPromise])
				.then(function (elements) {


					console.log(elements);

					// add the new element to the parent
					// giving the reference
					elements[0].addChildren(data.element, {
						after: elements[1]
					});

					return file.write();
				})
				.then(function () {
					onReload(socket);
				})
				.done();


		} else if (data.before) {
			// PROBLEMS
			// add before
			var referenceElementPromise = file.getElementAtXPath(data.before);

			q.all([parentElementPromise, referenceElementPromise])
				.then(function (elements) {

					// do operation using parent element
					elements[0].addChildren(data.element, {
						before: elements[1]
					});

					return file.write();

				})
				.then(function () {
					onReload(socket);
				})
				.done();

		} else {
			// add at the end of the children list
			
			parentElementPromise.then(function (parent) {

				// make edition
				parent.addChildren(data.element);

				// write to disk
				return file.write();
			})
			.then(function () {
				onReload(socket);
			});

		}

	}

	/**
	 * Removes the element at the given XPath.
	 */
	function onRemoveElement(socket, data) {
		// Load file indicated by the fname on data
		var file = projectDomFs.getFile(data.fname);	

		file.removeElementAtXPath(data.xPath)
			.then(function() {
				return file.write();
			})
			.then(function() {
				onReload(socket);
			});
	}

	/**
	 * Removes the content inside the element at the given
	 * xPath.
	 */
	function onRemoveInsideElement(socket, data) {
		// Load file indicated by the fname on data
		var file = projectDomFs.getFile(data.fname);

		// parentElement will be the element at the data.xPath
		var parentElementPromise = file.getElementAtXPath(data.xPath);

		parentElementPromise
			.then(function(parent) {
				// Now that we got the element, we'll remove its entire children
				// array.
				parent.removeChildren();

				// Since the parent had its children array cleaned up,
				// let's write the file so the canvas can have the changes
				return file.write();
			})
			.then(function() {
				onReload(socket);
			})
	}

	/**
	 * Changes the fab-source URL of all the elements in data.fname
	 * file. By changing the fab-source URL it means that
	 * the collection name in the URL (which should match data.oldSourceName)
	 * will be changed to data.newSourceName.
	 */
	function onChangeSourceName(socket, data) {
		// Load file indicated by the fname on data
		var file = projectDomFs.getFile(data.fname);

		// Changes the name of the collection in all matched fab-source URL
		file.changeSource(data.oldSourceName, data.newSourceName)
			.then(function() {

				// Now that we've got the DOM updated with the new source name,
				// we'll write the file to persist these modifications
				return file.write();
			})
			.then(function() {
				onReload(socket);
			});
	}

	/*
	 * Creates a new page for the app.
	 */
	function onCreateNewPage(socket, data) {
		/*
		 * The page creation will happen in three steps:
		 *
		 * 1 - We'll use the DomFs to create the necessary file.
		 * 2 - Then we'll insert a new route in the routes JSON file.
		 * 3 - then we'll inject a brand new HTML template into the
		 *	   HTML file created for the new page.
		 */
		var createPagePromise = projectDomFs.createNewPage(data);

		createPagePromise.then(function() {
			var fullPath = buildFullPathFromFname('www/js/app.js');
			console.log('FULL PATH: >>>> ' + fullPath);			

			var content = fs.readFileSync(fullPath, 'utf8');
			var ast = esprima.parse(content);

			var code = buildCodeForTemplate(data.name, fullPath);

			estraverse.traverse(ast, {
				enter: function(node, parent) {
					if (node.type === 'FunctionExpression' && node.params[0].name === '$stateProvider') {
						node.body.body.push(code);
					}
				}
			});

			setTimeout(function() {
				// fs.writeFile(fullPath, escodegen.generate(ast), function(err) {
				// 	if (err) {
				// 		console.log('Error while trying to write to: ' + fullPath);
				// 		console.log(JSON.stringify(err));
				// 	}
				// })
				console.log(JSON.stringify(ast, null, 4));
				console.log(escodegen.generate(ast));
			}, 2000);


		}, function(err) {
			console.log('New page could not be created');
			console.log(JSON.stringify(err));
		});
	}

	/*
	 * Deletes the content of the given column name.
	 * For instance, if we have the following HTML:
	 *
	 	<div>
			<h1>{{item.name}}</h1>
			<h1>{{item.age}}</h1>
			<h2>{{item.weight}}</h2>
			<h1>{{item.height}}</h1>
	 	</div>
	 * 
	 * And I wish to delete the line: <h1>{{item.age}}</h1>, so
	 * I'd pass age as column name.
	 */
	function onRemoveContentForColumnName(socket, data) {
		var file = projectDomFs.getFile(data.fname);

		var removeColumnContentPromise = file.removeColumnContent(data.columnName);

		removeColumnContentPromise
			.then(function() {

				// Save file
				return file.write();
			}, function(err) {
				console.log('Column content could not be removed.');
				console.log(JSON.stringify(err));
			})
			.then(function() {
				onReload(socket);
			});
	}


	// handles 'reload' events
	function onReload(socket) {
		console.log('reload');
		socket.emit('reload');
	}

	// handles 'cursorActivity' events
	function onCursorActivity(socket, data) {
		console.log('cursorActivity');

		// do parsing
		data = JSON.parse(data);

		// build full path to the file
		var cursorCharIndex = data.charIndex;

		buildDomFromFile(data.fname, function (err, markedDom) {

			if (err) {
				// TODO
				console.log('error!');
			}

			// find the node over which the cursor is
			var candidateElements = markedDomUtils.findAll(function (element) {
				// find an element with type 'tag'
				// whose startIndex is lower than the required cursorCharIndex
				// whose endIndex is higher than the required cursorCharIndex 

				var isTypeTag = element.type === 'tag',
					withinTag = (cursorCharIndex > element.startIndex && cursorCharIndex < element.endIndex);

				return isTypeTag && withinTag;

			}, markedDom);

			// get the deepest element found in the tree.
			// we assume that the candidateElements,
			// which are returned by the marked-dom-utils module '.find'
			// method are ordered by tree depth
			var finalElement = _.last(candidateElements);

			// POG POG POG POG
			if (finalElement) {

				// send event to the canvas
				var requiredData = [X_PATH_ATTRIBUTE, FNAME_ATTRIBUTE, START_INDEX_ATTRIBUTE, END_INDEX_ATTRIBUTE];
				var eventData = {};
				requiredData.forEach(function (attr) {
					eventData[attr] = finalElement.attribs[attr];
				});
				socket.broadcast.emit('highlight', JSON.stringify(eventData));
			}

		});
	}

	// create a watcher on the source files
	var sourceWatcher = false;

	// check if there is a file sourceWatcher
	// if not, create a new one
	function getSourceWatcher(callback) {

		if (sourceWatcher) {
			callback(sourceWatcher);
		} else {
			watch.createMonitor(options.projectsDir, {}, function (m) {
				sourceWatcher = m;

				callback(m);
			});
		}
	}

	// function to handle new socket connections
	return function onConnection(socket) {
		console.log("Connection accepted on Canvas Socket");

		socket.on('IDE:openHtml', _.partial(onOpenHtml, socket));
		socket.on('IDE:editAttribute', _.partial(onEditAttribute, socket));

		socket.on('reload', _.partial(onReload, socket));
		socket.on('cursorActivity', _.partial(onCursorActivity, socket));

		socket.on('addElement', _.partial(onAddElement, socket));
		socket.on('removeInsideElement', _.partial(onRemoveInsideElement, socket));
		socket.on('changeSourceName', _.partial(onChangeSourceName, socket));
		socket.on('removeElement', _.partial(onRemoveElement, socket));
		socket.on('createNewPage', _.partial(onCreateNewPage, socket));
		socket.on('removeContentForColumnName', _.partial(onRemoveContentForColumnName, socket));

		getSourceWatcher(function (watcher) {

			watcher.on('changed', function () {
				onReload(socket);
			});

			watcher.on('created', function () {
				console.log('created');
			});

			watcher.on('removed', function () {
				console.log('created');
			})
		});
		
	}
}


module.exports = configureOnConnection;

function buildCodeForTemplate(templateId) {
	return {
	    "type": "ExpressionStatement",
	    "expression": {
	        "type": "CallExpression",
	        "callee": {
	            "type": "MemberExpression",
	            "computed": false,
	            "object": {
	                "type": "Identifier",
	                "name": "$stateProvider"
	            },
	            "property": {
	                "type": "Identifier",
	                "name": "state"
	            }
	        },
	        "arguments": [
				{
					"type": "Literal",
					"value": templateId,
					"raw": "'" + templateId + "'"
				},
				{
		            "type": "ObjectExpression",
		            "properties": [
		                {
		                    "type": "Property",
		                    "key": {
		                        "type": "Identifier",
		                        "name": "url"
		                    },
		                    "computed": false,
		                    "value": {
		                        "type": "Literal",
		                        "value": "/" + templateId,
		                        "raw": "'/" + templateId + "'"
		                    },
		                    "kind": "init",
		                    "method": false,
		                    "shorthand": false
		                },
		                {
		                    "type": "Property",
		                    "key": {
		                        "type": "Identifier",
		                        "name": "templateUrl"
		                    },
		                    "computed": false,
		                    "value": {
		                        "type": "Literal",
		                        "value": path.join('templates', templateId + '.html'),
		                        "raw": "'" + path.join('templates', templateId + '.html') + "'"
		                    },
		                    "kind": "init",
		                    "method": false,
		                    "shorthand": false
		                }
		            ]
		        }
			]
	    }
	}
}