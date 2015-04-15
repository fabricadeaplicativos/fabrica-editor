var socket = io.connect('http://localhost:4000/canvas');



$(document).on('ready', function () {


	var contextMenuOptions = {
		zIndex: 99999999999999,
		selector: '*', 
		callback: function(key, options) {

			// find editable
			var $target = $(this),
				$editable = $target.closest('[data-x-path]');

			console.log('<--')
			if (key === 'edit') {

				var msg = [
					'edit',
					$editable.data('fname'),
					'at',
					$editable.data('xPath')
				]

				console.log(msg.join(' '))

				socket.emit('openFile', JSON.stringify({
					fname: $editable.data('fname')
				}));
			}

			if (key === 'methods') {
				// inspect scope
				var scope = angular.element($target).scope();

				var specialRegExp = /^\$.*/;

				for (k in scope) {
					

					if (!specialRegExp.test(k) && _.isFunction(scope[k])) {
						console.log('method: ' + k);
						console.log(scope[k]);
						console.log('----')

					}
				}
			}

			if (key === 'data') {
				// inspect scope
				var scope = angular.element($target).scope();

				var specialRegExp = /^\$.*/;

				for (k in scope) {
					

					if (!specialRegExp.test(k) && !_.isFunction(scope[k])) {
						console.log('data property: ' + k);
						console.log(scope[k]);
						console.log('----')

					}
				}

			}

			console.log('-->')

		},
		items: {
			"edit": {name: "Edit", icon: "edit"},
			"methods": {name: "Available methods", icon: "paste"},
			"data": {name: "Available data", icon: "paste"},
			// "copy": {name: "Copy", icon: "copy"},
			// "paste": {name: "Paste", icon: "paste"},
			// "delete": {name: "Delete", icon: "delete"},
			"sep1": "---------",
			"quit": {name: "Quit", icon: "quit"}
		}
	};


	$.contextMenu(contextMenuOptions);
	
	$('.context-menu-one').on('click', function(e){
		console.log('clicked', this);
	})

	setTimeout(function () {

		// editor({
		// 	editable: '[data-xpath]'
		// });
	}, 1000)
})