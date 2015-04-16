var _ = require('lodash');

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

	console.log(data);
}

// function to handle new socket connections
function onConnection(socket) {
	console.log("Connection accepted on Canvas Socket");

	socket.on('openFile', _.partial(onOpenFile, socket));
	socket.on('reload', _.partial(onReload, socket));
	socket.on('cursorActivity', _.partial(onCursorActivity, socket));
}


module.exports = onConnection;