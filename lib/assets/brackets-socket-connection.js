define('brackets-socket-connection', ['socket.io', 'command/Commands', 'command/CommandManager'], function (io, Commands, CommandManager) {
	var socket = io.connect('http://localhost:4000/canvas');

	var CMDOpenDoc = Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN;

	console.log('brackets-socket-connection ran')

	socket.on('openFile', function(data) {
		data = JSON.parse(data);

		CommandManager.execute(CMDOpenDoc, {fullPath: '/projects/app-source/www/' + data.fname});
	});


	return socket;
});

setTimeout(function () {
	require(['brackets-socket-connection'])
}, 2000)
