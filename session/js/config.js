angular.module('sl.session').run(['session', 'server', 'partials', '$compile', '$rootScope', function(session, server, partials, $compile, $rootScope) {
	
	server.request('auth/session/authenticate').then(
		function(response) {
			console.log(response.data);
			session.openSession(response.data.token, response.data.user);
		}, function() {
			console.log('closing session');
			session.closeSession();
		}
	);

}]);