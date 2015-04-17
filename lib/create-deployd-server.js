var deployd = require('deployd');

function createDeploydServer(options) {
	var server = deployd(options);

	server.listen();

	server.on('listening', function() {
		console.log('Deployd server at http://localhost:' + options.port);
	});
};

module.exports = createDeploydServer;