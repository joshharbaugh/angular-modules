angular.module('sl.permissions').run(['pages', function(pages) {
	pages.register('/permissions', 'Permissions', {partial:'(permissions,main)'});
}]);