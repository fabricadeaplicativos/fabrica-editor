var deployd = require('deployd');

function createDeploydServer(options) {
	var server = deployd(options);


	options.port = options.port || 3103

	server.listen();

	server.on('listening', function() {
		console.log('Deployd server at http://localhost:' + options.port);
	});
};

module.exports = createDeploydServer;