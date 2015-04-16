// native deps
var path = require('path');

// external deps


// internal deps
var createMarkedHtmlServer = require('./lib/create-marked-html-server'),
	createSocketServer = require('./lib/socket-server'),
	createBracketsServer = require('./lib/create-brackets-server');


// global options
var globalOptions = {
	projectsDir: path.join(__dirname, 'web')
}


/////////////////////
// Create the marked html server
createMarkedHtmlServer({
	port: 3000,
	
	root: globalOptions.projectsDir,
	xPathAttribute: 'data-x-path',
	fnameAttribute: 'data-fname'
});

/////////////////
// Create the socket server
createSocketServer({
	port: 4000,

	socketNamespace: '/canvas',

	// global
	projectsDir: globalOptions.projectsDir
});


/////////////////
// Create the brackets editor server
createBracketsServer({
	port: 8000,
	supportDir: path.join(__dirname, 'web/support'),

	// global
	projectsDir: globalOptions.projectsDir
});