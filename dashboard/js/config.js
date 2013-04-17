angular.module('sl.dashboard').run(['breadcrumbs', 'routing', 'pages', function(breadcrumbs, routing, pages) {
	console.log('registering dashboard');
	pages.register('/dashboard', 'Dashboard', {
		partial : '/modules/dashboard/partials/main.html'
	});
}]);
