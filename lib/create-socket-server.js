var path = require('path');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// socket js files that will go to the browser
function serveSocketIOAssets(options) {
	app.use('/assets', express.static(path.join(__dirname, '/assets')));
}


// socket backend
function createSocketServer(options) {

	var port = options.port || 4000;
	var socketNamespace = options.socketNamespace || '/canvas';


	serveSocketIOAssets(options);

	// Listen to port
	server.listen(port, function() {
		console.log('Socket server at http://localhost:' + port);
	});


// CONNETIONS
	io.of(socketNamespace).on('connection', function(socket) {
		console.log("Connection accepted on Canvas Socket");

		socket.on('openFile', function(filename) {

			console.log('openFile')
			socket.broadcast.emit('openFile', filename);
		});
	});
}

// export
module.exports = createSocketServer;