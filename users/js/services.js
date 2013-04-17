/**
 * The 'users' service
 *
 * @class users
 * @uses server
 * @uses $http
 * @uses $q
 * @uses $timeout
 * @namespace sl.users
 */
angular.module('sl.users').service('users', ['server','$rootScope', function(server,$rootScope) {
	
	var users = [];
	var requestTime = null;

	var service = {
		/**
		 * Load users using a promise.
		 * 
		 * @method load
         * @for users
         * @namespace sl.users
		 */
		load : function() {
			if(service.loadLocal() == null) {
				return server.request('auth/users/findAll').then(
					function(response) {
						users = response.data;
						requestTime = response.requestTime;
						service.saveLocal(users);
						$rootScope.$broadcast('dataLoaded', users);
						return users;
					}, function(reason) {
						console.log(reason);
					}
				);
			} else {
				users = service.loadLocal();
				$rootScope.$broadcast('dataLoaded', users);
				return users;
			}
		},
		data: function() {
			return service.load();
		},
		saveLocal : function(data) {
			localStorage["users"] = JSON.stringify(data);
		},
		loadLocal : function() {
			return JSON.parse(localStorage.getItem("users"));
		},
		getUserById : function(payload) {
			return server.request('auth/users/find', payload).then(
				function(response) {
					user = response.data;
					requestTime = response.requestTime;
					return user;
				}, function(reason) {
					console.log(reason);
				}
			);
		},
		/**
		 * Create user using a promise.
		 * 
		 * @method create
         * @for users
         * @namespace sl.users
         * @param {Array} payload
		 */
		create : function(payload) {
			return server.request('auth/users/create', payload).then(
				function(response) {
					user = response.data;
					requestTime = response.requestTime;
					users.push(user);
					service.saveLocal(users);
					return users;
				}, function() {
					console.log('error creating user');
				}
			);
		},
		/**
		 * Update user using a promise.
		 * 
		 * @method update
         * @for users
         * @namespace sl.users
         * @param {Array} payload
		 */
		update : function(payload) {
			return server.request('auth/users/update', payload).then(
				function(response) {
					user = response.data;
					requestTime = response.requestTime;
					service.saveLocal(users);
					return user;
				}, function() {
					console.log('error updating user');
				}
			);
		},
		/**
		 * Remove user using a promise.
		 * 
		 * @method remove
         * @for users
         * @namespace sl.users
         * @param {Array} payload
		 */
		remove : function(payload) {
			return server.request('auth/users/remove', {id:payload}).then(
				function(response) {
					requestTime = response.requestTime;
					for (var key in users) {
						if ( payload == users[key].id ) {
							users.splice(key,1);
						}
					}
					service.saveLocal(users);
					return users;
				}, function() {
					console.log('error removing user');
				}
			);
		},
		sync : function(payload) {
			return server.request('auth/users/delta', {time:payload}).then(
				function(response) {
					updated = response.data;
					requestTime = response.requestTime;
					if (updated.length > 0) {
					    service.saveLocal(users);
					}
					return users;
				}, function() {
					console.log('error getting users');
				}
			);
		}
	}
	return service;
}]);

/**
 * The 'groups' service
 *
 * @class groups
 * @uses server
 * @uses $http
 * @uses $q
 * @uses $timeout
 */
angular.module('sl.users').service('groups', ['server','$rootScope', function(server,$rootScope) {

	var groups = [];
	var requestTime = null;

	var service = {
		/**
		 * Load groups using a promise.
		 * 
		 * @method load
         * @for groups
         * @namespace sl.users
		 */
		load : function() {
			if(service.loadLocal() == null) {
				return server.request('auth/groups/findAll').then(
					function(response) {
						groups = response.data;
						requestTime = response.requestTime;
						service.saveLocal(groups);
						return groups;
					}, function(reason) {
						console.log(reason);
					}
				);
			} else {
				groups = service.loadLocal();
				return groups;
			}
		},
		saveLocal : function(data) {
			localStorage["groups"] = JSON.stringify(data);
		},
		loadLocal : function() {
			return JSON.parse(localStorage.getItem("groups"));
		},
		/**
		 * Find group using a promise.
		 * 
		 * @method find
         * @for groups
         * @namespace sl.users
		 */
		find : function(payload) {
			return server.request('auth/groups/find', payload).then(
				function(response) {
					group = response.data;
					requestTime = response.requestTime;
					return group;
				}, function() {
					console.log('error finding group');
				}
			);
		},
		/**
		 * Create group using a promise.
		 * 
		 * @method create
         * @for groups
         * @namespace sl.users
         * @param {Array} payload
		 */
		create : function(payload) {
			return server.request('auth/groups/create', payload).then(
				function(response) {
					group = response.data;
					requestTime = response.requestTime;
					return group;
				}, function() {
					console.log('error creating group');
				}
			);
		},
		/**
		 * Update group using a promise.
		 * 
		 * @method update
         * @for groups
         * @namespace sl.users
         * @param {Array} payload
		 */
		update : function(payload) {
			return server.request('auth/groups/update', payload).then(
				function(response) {
					group = response.data;
					requestTime = response.requestTime;
					return group;
				}, function() {
					console.log('error updating group');
				}
			);
		},
		/**
		 * Remove group using a promise.
		 * 
		 * @method remove
         * @for groups
         * @namespace sl.users
         * @param {Array} payload
		 */
		remove : function(payload) {
			return server.request('auth/groups/remove', payload).then(
				function(response) {
					group = response.data;
					requestTime = response.requestTime;
					return group;
				}, function() {
					console.log('error removing group');
				}
			);
		},
		/**
		 * Delta
		 */
		sync : function(payload) {
			return server.request('auth/groups/delta', {time:payload}).then(
				function(response) {
					groups = response.data;
					requestTime = response.requestTime;
					service.saveLocal(groups);
					return groups;
				}, function(reason) {
					console.log(reason);
				}
			);
		}
	};
	return service;
}]);

/**
 * The 'roles' service
 *
 * @class roles
 * @uses server
 * @uses $q
 * @uses $timeout
 * @namespace sl.users
 */
angular.module('sl.users').service('roles', ['server','$rootScope', function(server,$rootScope) {	
	
	var roles = [];
	var requestTime = null;

	var service = {
		/**
		 * Get roles using a promise
		 * 
		 * @method get
         * @for roles
         * @namespace sl.users
		 */
		load : function() {
			if (service.loadLocal() == null) {
				return server.request('auth/roles/findAll').then(
					function(response) {
						roles = response.data;
						requestTime = response.requestTime;
						service.saveLocal(roles);
						return roles;
					}, function(reason) {
						console.log(reason);
					}
				);
			} else {
				roles = service.loadLocal();
				return roles;
			}
		},
		saveLocal : function(data) {
			localStorage["roles"] = JSON.stringify(data);
		},
		loadLocal : function() {
			return JSON.parse(localStorage.getItem("roles"));
		},
		/**
		 * Find role using a promise.
		 * 
		 * @method find
         * @for roles
         * @namespace sl.users
		 */
		find : function(payload) {
			return server.request('auth/roles/find', payload).then(
				function(response) {
					role = response.data;
					requestTime = response.requestTime;
					return role;
				}, function() {
					console.log('error finding role');
				}
			);
		},
		/**
		 * Create roles using a promise.
		 * 
		 * @method create
         * @for roles
         * @namespace sl.users
         * @param {String} payload
		 */
		create : function(payload) {
			return server.request('auth/roles/create', payload).then(
				function(response) {
					role = response.data;
					requestTime = response.requestTime;
					return role;
				}, function() {
					console.log('error creating role');
				}
			);
		},
		/**
		 * Update role using a promise.
		 * 
		 * @method update
         * @for roles
         * @namespace sl.users
         * @param {Array} payload
		 */
		update : function(payload) {
			return server.request('auth/roles/update', payload).then(
				function(response) {
					role = response.data;
					requestTime = response.requestTime;
					return role;
				}, function() {
					console.log('error updating role');
				}
			);
		},
		/**
		 * Remove role using a promise.
		 * 
		 * @method remove
         * @for roles
         * @namespace sl.users
         * @param {Array} payload
		 */
		remove : function(payload) {
			return server.request('auth/roles/remove', payload).then(
				function(response) {
					role = response.data;
					requestTime = response.requestTime;
					return role;
				}, function() {
					console.log('error removing role');
				}
			);
		}
	};
	return service;
}]);
