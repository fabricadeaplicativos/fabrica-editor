var path = require('path');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


// internal deps
var onConnection = require('./lib/on-connection');

// socket js files that will go to the browser
function serveSocketIOAssets(options) {
	app.use('/assets', express.static(path.join(__dirname, '/assets')));
}


// socket backend
function createSocketServer(options) {

	console.log(process.env.PROJECT_ROOT);


	var port = options.port || 3102;
	var socketNamespace = options.socketNamespace || '/canvas';

	// serve assets
	serveSocketIOAssets(options);

	// Listen to port
	server.listen(port, function() {
		console.log('Socket server at http://localhost:' + port);
	});


	// CONNETIONS
	io.of(socketNamespace).on('connection', onConnection(options));
}

// export
module.exports = createSocketServer;