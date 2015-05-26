define('brackets-socket-connection', ['socket.io', 'command/Commands', 'command/CommandManager', 'document/DocumentManager', 'editor/EditorManager', 'view/MainViewManager'], function (io, Commands, CommandManager, DocumentManager, EditorManager, MainViewManager) {


	// get port of the socketServer
	var socketServerPort = window.socketServerPort || 3102;

	// main socket
	var socket = window.socket = io.connect('http://localhost:' + socketServerPort + '/canvas');
	// brackets server socket
	var bracketsSocket = io.connect("/brackets");

	var FS_ROOT = '/projects/';

	/////////////
	// HELPERS //
	/**
	 * Retrieves an object pointing to the cursor position
	 * in the editor for a given document and characterIndex
	 * @param  {[type]} doc   [description]
	 * @param  {[type]} index [description]
	 * @return {[type]}       [description]
	 */
	function getCursorPositionFromCharIndex(doc, charIndex) {

		var charCount = 0,
			lineNo    = 0;

		while (charCount < charIndex) {

			var line = doc.getLine(lineNo);

			console.log('line ' + lineNo + ':' + line.length);

			lineNo++
			charCount += line.length + 1; // add \n (they are forgotten as whe read line positions)
		}

		// console.log(charIndex);
		// console.log(charCount);
		// console.log(doc.getLine(lineNo - 1).length);

		return {
			line: lineNo - 1,
			ch: charIndex - (charCount - doc.getLine(lineNo - 1).length) + 1 // add 1 due to the index's 0 based counting and the editor 1 based column system
		};
	}

	function getCharIndexFromCursorPosition(doc, position) {
		var charCount = position.ch,
			lineNo = position.line - 1;

		while (lineNo >= 0) {

			// get the line from the document
			var line = doc.getLine(lineNo);

			charCount += line.length + 1;

			lineNo--;
		}

		return charCount;
	}
	// HELPERS //
	/////////////

	///////////////////////////
	// SOCKET EVENT HANDLERS //
	socket.on('IDE:openHtml', function(data) {
		// data = JSON.parse(data);

		console.log(data);

		// path of file to be opened
		var fullPath = FS_ROOT + data.fname;

		CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN, {
			fullPath: fullPath
		}).then(function () {

			// get the editor for the file
			var editor = EditorManager.getActiveEditor();

			// get the position
			var position = getCursorPositionFromCharIndex(editor.document, data.startIndex);

			// set cursor position
			editor.setCursorPos(position.line, position.ch + 1);

		}, function () {
			alert('could not open ' + fullPath);
		});
	});

	bracketsSocket.on('FILE:change', function (data) {

		// path of the file to be opened
		var fullPath = FS_ROOT + data.fname;

		DocumentManager.getDocumentForPath(fullPath)
			.then(function (doc) {

				if (doc.getText() !== data.contents) {
					// doc.setText(data.contents);
				}

			}, function (err) {
				alert('could not retrieve ' + fullPath);
			})

		console.log('file changed');
		console.log(data);
	});
	// SOCKET EVENT HANDLERS //
	///////////////////////////


	///////////////////////////
	// SOCKET EVENT EMITTERS //
	// emit reload event when documents are saved
	$(DocumentManager).on('documentSaved', function () {
		socket.emit('reload');
	});


	function onCurrentFileChange() {

		// get the activeEditor and set listeners on it
		var activeEditor = EditorManager.getActiveEditor();

		// listen to cursorActivity on activeEditor
		$(activeEditor).on('cursorActivity', function () {

			console.log('cursorActivity')

			// Emit 'cursorActivity' event
			var data = {

				charIndex: getCharIndexFromCursorPosition(activeEditor.document, activeEditor.getCursorPos()),
				fname: activeEditor.document.file.fullPath.replace(new RegExp('^' + FS_ROOT), ''),
			};

			socket.emit('cursorActivity', JSON.stringify(data));
		});


		$(activeEditor.document).on('change', function () {
			CommandManager.execute(Commands.FILE_SAVE).then(function () {

				console.log('saved');

			}, function () {
				alert('could not save ' + fullPath);
			});
		});

	}
	$(MainViewManager).on('currentFileChange', onCurrentFileChange);
	// call the onCurrentFileChange on start up
	onCurrentFileChange();

	// SOCKET EVENT EMITTERS //
	///////////////////////////
	return socket;
});


var interval = setInterval(function () {
	require(['brackets-socket-connection'], function () {
		console.log('interval cleared')
		clearInterval(interval);
	})
}, 2000)
