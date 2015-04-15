// native
var path = require('path'),
	http = require('http');

// third-party
var express = require('express'),
	_       = require('lodash');

// internal dependencies
var brackets = require('../_sub-applications/brackets');
// var brackets = require('brackets');


// create express app 
var app = express();

app.get('/', function (req, res) {
	res.redirect('/brackets');
});

function creatBracketsServer(options) {
	_.defaults(options, {
		port: 8000,
		// httpRoot: '/',
	});

	if (!options.projectsDir) {
		throw new Error('Brackets server requires projectsDir')
	}

	if (!options.supportDir) {
		throw new Error('Brackets server requires supportDir')
	}

	// create the server
	var server = http.createServer(app);

	// instantiate the server
	brackets(server, options);

	// listen
	server.listen(options.port, function () {
		console.log('Brackets server at http://localhost:' + options.port + '/brackets');
	});
}


// export
module.exports = creatBracketsServer;