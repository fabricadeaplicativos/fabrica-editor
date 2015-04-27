angular.module('dd', [])

.directive('fabData', function ($http) {



	return {
		restrict: 'AE',
		link: function (scope, element, attrs, ctrls, transclude) {


			var scopeProperty = attrs.fabData || attrs.fabDataProperty;
			var dataSrc = attrs.fabDataSrc;

			// set the data to the scope
			scope[scopeProperty] = {};

			// do request and alter set result to the data value
			$http.get(dataSrc).then(function (res) {
				console.log(res);

				scope[scopeProperty] = res.data;
			});



			// BIND EVENTS
			// forms
			element.find('form').bind('submit', function () {

				$http.put(dataSrc, scope[scopeProperty])
					.then(function (res) {
						scope.$apply()
					})

				console.log(arguments)
				alert('11231')
			})
		},
	}
});