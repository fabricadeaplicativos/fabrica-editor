var commander = require('commander');

var startEditor = require('../');

commander
    .version('0.0.1')
    .usage('[options]')
    .option('-a, --attribute [attribute]')
    .parse(process.argv);

if(!commander.args.length) {
    commander.help();
} else {

	var projectsDir = commander.args[0];

	startEditor({
		projectsDir: projectsDir
	});
}