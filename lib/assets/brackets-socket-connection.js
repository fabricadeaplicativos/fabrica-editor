define('brackets-socket-connection', ['socket.io', 'command/Commands', 'command/CommandManager', 'document/DocumentManager'], function (io, Commands, CommandManager, DocumentManager) {
	var socket = window.socket = io.connect('http://localhost:4000/canvas');

	var CMDOpenDoc = Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN;

	console.log('brackets-socket-connection ran')

	socket.on('openFile', function(data) {
		data = JSON.parse(data);

		CommandManager.execute(CMDOpenDoc, {fullPath: '/projects/app-source/www/' + data.fname});
	});


	// emit reload event when documents are saved
	$(DocumentManager).on('documentSaved', function () {
		socket.emit('reload');
	});


	return socket;
});

setTimeout(function () {
	require(['brackets-socket-connection'])
}, 2000)
