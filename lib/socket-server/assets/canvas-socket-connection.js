(function () {

	// get port of the socketServer
	var socketServerPort = window.socketServerPort || 3102;

	// create socket
	var socket = io.connect('http://localhost:' + socketServerPort + '/canvas');

	//////////////////////////
	// HANDLE SOCKET EVENTS //
	socket.on('reload', function () {
		location.reload(true);
	});

	socket.on('highlight', function (d) {
		var data = JSON.parse(d);

		console.log(data)

		try {
			Domlight.hideAll();
		} catch (e) {
			//
		}

		// build query string
		var queryString = '[data-x-path="' + data['data-x-path'] + '"]';

		// select the element
		var $highlight = $(queryString);

		// only do highlighting if the element is visible
		if ($highlight.length && $highlight.is(':visible')) {

			var highlightOptions = {
				fadeDuration: 700,	// Duration of the overlay transition (milliseconds).
				hideOnClick: true,	// Hides the overlay when the user click into it.
				hideOnESC: true,	// Hides the overlay when the user press Esc.
				findOnResize: true	// Refind the element in the DOM in case that the element don't still exists.
			}

			Domlight($highlight, highlightOptions);
		} else {
			console.warn('Element either not visible or does not exist: ' + queryString);
		}
	})
	// HANDLE SOCKET EVENTS //
	//////////////////////////


	///////////////////////////
	// EMIT EVENTS TO SOCKET //
	function socketOpenFile() {

	}
	
	function editFile() {

	}
	// EMIT EVENTS TO SOCKET //
	///////////////////////////
	
	//////////////////
	// CONTEXT MENU //
	
	var actions = {
		openHtml: function ($editable, basicData) {
			socket.emit('IDE:openHtml', basicData);
		},

		openCss: function ($editable, basicData) {
			socket.emit('IDE:openCss', basicData);
		},

		editNgClick: function ($editable, basicData) {

			var data = _.clone(basicData);

			data.attribute = 'ng-click';
			data.value = prompt('What action?');

			socket.emit('IDE:editAttribute', data);
		},

		editFabDataSrc: function ($editable, basicData) {

			var data = _.clone(basicData);

			data.attribute = 'fab-data-src';
			data.value = prompt('Qual a url dos dados?');

			socket.emit('IDE:editAttribute', data);
		},

		remove: function ($editable, basicData) {
			console.log('remove ' + JSON.stringify(basicData));
		}
	}

	


	function buildContextMenu() {

		var contextMenuOptions = {
			zIndex: 999999999999999999,
			selector: '*', 
			callback: function(key, options) {

				// find editable
				var $target = $(this),
					$editable = $target.closest('[data-x-path]');

				// read basic data for the event
				var basicData = {
					fname: $editable.data('fname'),
					xPath: $editable.data('xPath'),

					startIndex: $editable.data('startIndex'),
					endIndex: $editable.data('endIndex')
				};

				// invoke correct action
				actions[key]($editable, basicData);
			},
			items: {
				"openHtml": { name: "HTML", icon: "paste" },
				"openCss": { name: "CSS", icon: "paste" },
				"editNgClick": { name: "Edit ng-click", icon: "edit" },
				"editFabDataSrc": { name: "Edit fab-data-src", icon: "edit" },
				"sep1": "---------",
				"remove": { name: "Remove", icon: "quit" }
			}
		};

		// build it!
		$.contextMenu(contextMenuOptions);
	}
	// CONTEXT MENU //
	//////////////////

	$(document).on('ready', function () {

		buildContextMenu();
	})

})()
