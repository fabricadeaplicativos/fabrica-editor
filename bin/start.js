var commander = require('commander');

var startEditor = require('../');

commander
    .version('0.0.1')
    .usage('[options]')
    .option('-a, --attribute [attribute]')
    .option('-h, --host [host]')
    .option('-p, --port [port]')
    .parse(process.argv);

if(!commander.args.length) {
    commander.help();
} else {

	// project dir
	var projectsDir = commander.args[0];

	// host and port
	var socketHost = commander.host,
		socketPort = commander.port;

	startEditor({
		projectsDir: projectsDir,

		
		socketHost: socketHost,
		socketPort: socketPort
	});
}