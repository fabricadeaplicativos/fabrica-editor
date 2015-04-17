// native
var path = require('path'),
	fs   = require('fs');

// third-party
var _     = require('lodash'),
	watch = require('watch');

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

		buildDomFromFile(data.fname, function (err, markedDom) {

			// find the element to modify
			var element = markedDomUtils.findOne(function (e) {

				// only tags
				if (e.type !== 'tag') {
					return false;
				}

				// file verification
				var isCorrectFile = e.attribs[FNAME_ATTRIBUTE] === data.fname;

				// xpath verification
				var isCorrectNode = e.attribs[X_PATH_ATTRIBUTE] === data.xPath;

				return isCorrectFile && isCorrectNode;

			}, markedDom);

			// modify it
			element.attribs[data.attribute] = data.value;

			// write the file
			writeDomToFile(data.fname, markedDom, function () {
				onReload(socket);
			});
		})
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

		getSourceWatcher(function (watcher) {

			watcher.on('changed', function () {
				// onReload(socket);
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