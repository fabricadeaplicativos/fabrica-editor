// native deps
var path = require('path');

// external deps
var _ = require('lodash');

// internal deps
var createMarkedHtmlServer = require('./lib/create-marked-html-server'),
	createSocketServer = require('./lib/socket-server'),
	createBracketsServer = require('./lib/create-brackets-server'),
	createDeploydServer = require('./lib/create-deployd-server');



// PORTS at which each server will work
var PORTS = {
	markedHtmlServer: 3100,
	bracketsServer: 3101,
	socketServer: 3102,
	deploydServer: 3103
};

function startEditor(options) {

	if (!options.projectsDir) {
		throw new Error('"projectsDir" option is required :)')
	}

	// stylesheets to be injected
	var baseInjectStylesheets = [
		// context menu
		'http://localhost:' + PORTS.socketServer + '/assets/bower_components/jQuery-contextMenu/src/jquery.contextMenu.css'
	];

	// Scripts to be injected into the markedHTML
	var baseInjectScripts = [
		// jquery and lodash
		'http://localhost:' + PORTS.socketServer + '/assets/bower_components/jquery/dist/jquery.js',
		'http://localhost:' + PORTS.socketServer + '/assets/bower_components/lodash/lodash.js',
		
		// contextmenu
		'http://localhost:' + PORTS.socketServer + '/assets/bower_components/jQuery-contextMenu/src/jquery.ui.position.js',
		'http://localhost:' + PORTS.socketServer + '/assets/bower_components/jQuery-contextMenu/src/jquery.contextMenu.js',

		// socket.io
		'http://localhost:' + PORTS.socketServer + '/assets/bower_components/socket.io-client/socket.io.js',
		// domlight
		'http://localhost:' + PORTS.socketServer + '/assets/node_modules/domlight/domlight.js',

		// socket connection
		'http://localhost:' + PORTS.socketServer + '/assets/canvas-socket-connection.js'
	];


	/////////////////////
	// Create the marked html server
	createMarkedHtmlServer({
		port: PORTS.markedHtmlServer,
		
		root: options.projectsDir,
		xPathAttribute: 'data-x-path',
		fnameAttribute: 'data-fname',

		// stylesheets to be injected
		injectStylesheets: options.injectStylesheets ? baseInjectStylesheets.concat(options.injectStylesheets) : baseInjectStylesheets,

		// scripts to be injected
		injectScripts: options.injectScripts ? baseInjectScripts.concat(options.injectScripts) : baseInjectScripts
	});



	/////////////////
	// Create the brackets editor server
	createBracketsServer({
		port: PORTS.bracketsServer,
		projectsDir: options.projectsDir,
		supportDir: path.join(__dirname, 'support'),
	});

	/////////////////
	// Create the socket server
	createSocketServer({
		port: PORTS.socketServer,

		socketNamespace: '/canvas',

		// global
		projectsDir: options.projectsDir
	});

	// createDeploydServer({
	// 	port: PORTS.deploydServer,
	// 	env: 'development', 
	// 	db: {
	// 		host: 'localhost',
	// 		port: 27017,
	// 		name: 'dpd'
	// 	}
	// });

	// return editor configurations
	return {
		projectsDir: options.projectsDir,
		ports: _.clone(PORTS),
	}


	// NEEDS IMPROVEMENT: deployd server


}

// export
module.exports = startEditor;



