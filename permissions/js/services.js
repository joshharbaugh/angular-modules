/**
 * Defines the permissions module
 *
 * @module permissions
 */

/**
 * The 'permissions' service
 *
 * @class permissions
 * @uses $http
 * @uses $q
 * @uses $timeout
 * @namespace sl.permissions
 */
angular.module('sl.permissions').service('permissions', ['$http','$q','$timeout', function($http,$q,$timeout) {	
	var service = {
		/**
		 * Load permissions using a promise.
		 * 
		 * @method load
         * @for permissions
         * @namespace sl.permissions
		 */
		load : function() {
			var deferred = null;
			var url = 'modules/permissions/json/permissions.json';
			deferred = $q.defer();
			$http({method:'GET',url:url})
				.success(function(data,status,headers,config) {
					deferred.resolve(data.modules);
				})
				.error(function(data,status,headers,config) {
					deferred.reject(status);
					delete loaded[url]; 
				});
			return deferred.promise;
		},
		/**
		 * Remove permission using a promise.
		 * 
		 * @method remove
         * @for permissions
         * @namespace sl.permissions
         * @param {Array} payload
		 */
		remove : function(payload) {
			var deferred = null;
			var url = '/permissions/:remove';
			deferred = $q.defer();
			$timeout(function() {
				deferred.resolve(payload);
			});
			/**
			$http.post(url, payload)
				.success(function(data,status,headers,config) {
					deferred.resolve(data);
				})
				.error(function(data,status,headers,config) {
					deferred.reject(status);
				});
			*/
			return deferred.promise;
		}
	};
	return service;
}]);