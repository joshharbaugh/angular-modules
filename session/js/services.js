angular.module('sl.session').service('session', ['$rootScope', function($rootScope) {
	
	var currentUser = null;

	var service = {
		
		getToken: function() {
			return $.cookie("sessionToken");
		},

		getUser: function() {
			return currentUser;
		},

		openSession: function(token, user) {
			$.cookie("sessionToken", token);
			currentUser = user;
			$.cookie("lastEmail", user.email);
			$rootScope.$broadcast('session/opened');
		},

		closeSession: function() {
			currentUser = null;
			$.cookie("sessionToken", null);
			$rootScope.$broadcast('session/closed');
			console.log('session closed');
		},

		getLastEmail: function() {
			return $.cookie("lastEmail");
		}

	};
	return service;

}]);