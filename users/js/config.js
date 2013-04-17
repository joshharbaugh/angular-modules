angular.module('sl.users').run(['pages','partials', function(pages,partials) {
	pages.register('/users', 'Users', {partial:'(users,main)'});
	pages.register('/users/new', 'New User', {partial:'(users,addUser)'});
	pages.register(/\/users\/edit\/.*/, 'Edit User', {partial:'(users,editUser)'});
}]);