angular.module('sl.dealerships').run(['blocks','pages', function(blocks,pages) {
	blocks.register('dashboard', {partial:'/modules/dealerships/partials/dashboard.html'});
	pages.register('/dealerships', 'Dealerships', {partial:'/modules/dealerships/partials/main.html'});
}]);