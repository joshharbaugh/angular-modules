angular.module('sl.session').directive('slSignInBox', ['partials','$compile', '$rootScope', function(partials,$compile, $rootScope) {

	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			partials.load('(session,loginForm)').then(function(html) {
				element.html(html);
				$compile(element.contents())($rootScope.$new());
			});
		}
	};

}]);

angular.module('sl.session').directive('slSessionMenu', ['partials','$compile', '$rootScope', function(partials,$compile, $rootScope) {

	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			partials.load('(session,sessionMenu)').then(function(html) {
				element.html(html);
				$compile(element.contents())($rootScope.$new());
			});
		}
	};

}]);