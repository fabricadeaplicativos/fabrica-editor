var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var IO_NAMESPACE = '/canvas';

// Listen to port 3000
server.listen(3000, function() {
	console.log("Server Running...");
});

io.of(IO_NAMESPACE).on('connection', function(socket) {
	console.log("Connection accepted on Canvas Socket");

	socket.on('send message', function(message) {
		console.log('Sending message to sockets: ' + message);

		socket.broadcast.emit('show alert', message);
	});
});