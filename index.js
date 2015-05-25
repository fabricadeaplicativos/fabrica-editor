// native deps
var path = require('path');

// external deps
var _ = require('lodash');

var dpdProxy = require('dpd-proxy');

// internal deps
var createMarkedHtmlServer = require('./lib/create-marked-html-server'),
	createSocketServer = require('./lib/socket-server'),
	createBracketsServer = require('./lib/create-brackets-server');
	// createDeploydServer = require('./lib/create-deployd-server');



// PORTS at which each server will work
var PORTS = {
	markedHtmlServer: 3100,
	bracketsServer: 3101,
	socketServer: 3102,
	deploydProxy: 3103,
	deploydServer: 3104
};

var defaultHost = 'http://localhost';

function startEditor(options) {

	if (!options.projectsDir) {
		throw new Error('"projectsDir" option is required :)')
	}

	// CANVAS_CONFIG
	var CANVAS_CONFIG = {
		socketHost: options.socketHost || defaultHost,
		socketPort: options.socketPort || PORTS.socketServer,
	};

	// stylesheets to be injected
	var baseInjectStylesheets = [
		// context menu
		CANVAS_CONFIG.socketHost + ':' + CANVAS_CONFIG.socketPort + '/assets/bower_components/jQuery-contextMenu/src/jquery.contextMenu.css'
	];

	// Scripts to be injected into the markedHTML
	var baseInjectScripts = [
		// configurations
		{
			type: 'tag',
			name: 'script',
			attribs: {
				id: 'teste'
			},
			children: [
				{
					data: 'window.CANVAS_CONFIG = ' + JSON.stringify(CANVAS_CONFIG)
				}
			]
		},

		// jquery and lodash
		CANVAS_CONFIG.socketHost + ':' + CANVAS_CONFIG.socketPort + '/assets/bower_components/jquery/dist/jquery.js',
		CANVAS_CONFIG.socketHost + ':' + CANVAS_CONFIG.socketPort + '/assets/bower_components/lodash/lodash.js',
		
		// contextmenu
		CANVAS_CONFIG.socketHost + ':' + CANVAS_CONFIG.socketPort + '/assets/bower_components/jQuery-contextMenu/src/jquery.ui.position.js',
		CANVAS_CONFIG.socketHost + ':' + CANVAS_CONFIG.socketPort + '/assets/bower_components/jQuery-contextMenu/src/jquery.contextMenu.js',

		// socket.io
		CANVAS_CONFIG.socketHost + ':' + CANVAS_CONFIG.socketPort + '/assets/bower_components/socket.io-client/socket.io.js',
		// domlight
		CANVAS_CONFIG.socketHost + ':' + CANVAS_CONFIG.socketPort + '/assets/node_modules/domlight/domlight.js',

		// socket connection
		CANVAS_CONFIG.socketHost + ':' + CANVAS_CONFIG.socketPort + '/assets/canvas-socket-connection.js'
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

	// deployd proxy server
	dpdProxy({
		proxy: {
			port: PORTS.deploydProxy,
			resourcesDirectory: options.resourcesDirectory,
		},
		deployd: {
			port: PORTS.deploydServer,
			env: 'development',
		}
	});


	// return editor configurations
	return {
		projectsDir: options.projectsDir,
		ports: _.clone(PORTS),
	}


	// NEEDS IMPROVEMENT: deployd server


}

// export
module.exports = startEditor;



