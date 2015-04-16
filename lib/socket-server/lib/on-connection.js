// native
var path = require('path'),
	fs   = require('fs');

// third-party
var _ = require('lodash');

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

	// handles 'openFile' events
	function onOpenFile(socket, filename) {

		console.log('openFile')
		socket.broadcast.emit('openFile', filename);
	}

	// handles 'reload' events
	function onReload(socket) {
		console.log('reload');
		socket.broadcast.emit('reload');
	}

	// handles 'cursorActivity' events
	function onCursorActivity(socket, data) {
		console.log('cursorActivity');

		// do parsing
		data = JSON.parse(data);

		// build full path to the file
		var fullPath        = path.join(options.projectsDir, data.fname),
			cursorCharIndex = data.charIndex;

		// read the file
		fs.readFile(fullPath, function (err, contents) {

			if (err) {
				// TODO
			}

			// build the marked dom
			var markedDom = markedDomUtils.buildMarkedDom(contents, {
				fname: data.fname,
				xPathAttribute: X_PATH_ATTRIBUTE,
				fnameAttribute: FNAME_ATTRIBUTE,
				startIndexAttribute: START_INDEX_ATTRIBUTE,
				endIndexAttribute: END_INDEX_ATTRIBUTE
			});

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

	// function to handle new socket connections
	return function onConnection(socket) {
		console.log("Connection accepted on Canvas Socket");

		socket.on('openFile', _.partial(onOpenFile, socket));
		socket.on('reload', _.partial(onReload, socket));
		socket.on('cursorActivity', _.partial(onCursorActivity, socket));
	}
}


module.exports = configureOnConnection;