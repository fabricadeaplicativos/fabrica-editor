define('brackets-socket-connection', ['socket.io', 'command/Commands', 'command/CommandManager', 'document/DocumentManager', 'editor/EditorManager', 'view/MainViewManager'], function (io, Commands, CommandManager, DocumentManager, EditorManager, MainViewManager) {
	var socket = window.socket = io.connect('http://54.149.44.181:4000/canvas');


	var FS_ROOT = '/projects/';

	var CMDOpenDoc = Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN;


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


	console.log('brackets-socket-connection ran')

	socket.on('openFile', function(data) {
		data = JSON.parse(data);

		console.log(data);

		// path of file to be opened
		var fullPath = FS_ROOT + data.fname;

		CommandManager.execute(CMDOpenDoc, {
			fullPath: fullPath
		}).then(function () {

			// get the editor for the file
			var editor = EditorManager.getActiveEditor();

			// get the position
			var position = getCursorPositionFromCharIndex(editor.document, data.startIndex);

			// set cursor position
			editor.setCursorPos(position.line, position.ch);

		}, function () {
			alert('could not open ' + fullPath);
		});
	});


	// emit reload event when documents are saved
	$(DocumentManager).on('documentSaved', function () {
		socket.emit('reload');
	});


	$(MainViewManager).on('currentFileChange', function (e, newFile, newPaneId, oldFile, oldPaneId) {

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



	});


	return socket;
});

setTimeout(function () {
	require(['brackets-socket-connection'])
}, 2000)
