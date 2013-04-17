/**
 * Defines the blocks module
 *
 * @module blocks
 */

/**
 * The 'blocks' service
 *
 * @class blocks
 * @uses store
 * @namespace sl.blocks
 */
angular.module('sl.blocks').service('blocks', ['store', function(store) {
	return store.getService('blocks');
}]);

/**
 * The 'pages' service
 *
 * @class pages
 * @uses blocks
 * @uses navigation
 */
angular.module('sl.blocks').service('pages', ['blocks','navigation',function(blocks) {
    var pages = TAFFY([]);
	
	var service = {
        /**
         * Registers a page
         *
         * @method register
         * @for pages
         * @namespace sl.blocks
         * @param {String} url
         * @param {String} title
         * @param {Array} params
         */
		register:function(url, title, params) {
			var copy = jQuery.extend({}, params);
			copy.url = url;
			copy.title = title;
			pages.insert(copy);
			
			var oldShow = typeof copy.onShow != 'undefined' ? copy.onShow : function() {};
			var onShow = function(scope) {
				scope.contentModule = title;
				oldShow.apply(this, arguments);
			};
			copy.onShow = onShow;
			
			var oldHide = typeof copy.onHide != 'undefined' ? copy.onHide : function() {};
			var onHide = function(scope) {
				scope.contentModule = '';
				oldHide.apply(this, arguments);
			};
			copy.onHide = onHide;
			
			blocks.register('main', copy);
		}
	};
	return service;
}]);

/**
 * The 'partials' service
 *
 * @class partials
 * @uses $http
 * @uses $q
 * @uses $timeout
 */
angular.module('sl.blocks').service('partials', ['$http','$q','$timeout', function($http,$q,$timeout) {
	var loaded = {};
	
	var service = {
		/**
		 * Ajax loads a partial using a promise.
		 * 
		 * @method load
         * @for partials
         * @namespace sl.blocks
         * @param {String} url
         * @param {Boolean} force
		 */
		load : function(url, force) {
			var modularMatch = url.match(/\s*\(\s*([\\\-\.\w]+)\s*,\s*([\\\-\.\w]+)\s*\)\s*/);
			if( modularMatch ) {
				url = '/modules/'+modularMatch[1]+'/partials/'+modularMatch[2]+'.html';
			}
			var deferred = null;
			if( typeof loaded[url] == 'undefined' || force ) {
				deferred = $q.defer();
				loaded[url] = {loading:true,deferred:deferred};
				$http({method:'GET',url:url})
					.success(function(data) {
						loaded[url].loading = false;
						loaded[url].success = true;
						loaded[url].result = data;
						deferred.resolve(data);
						
						// Only hold on to partials for a few minutes
						// we don't want our cache to be too big
						$timeout(function() {
							console && console.log && console.log('Removing ', url, ' from partials cache');
							delete(loaded[url]);
						}, 300000); 
					})
					.error(function(data,status,headers,config) {
						// reset the cache so we can try to load it again later
						delete loaded[url]; 
						
						deferred.reject(status);
					});
			} else {
				if( loaded[url].loading ) {
					deferred = loaded[url].deferred;
				} else {
					deferred = $q.defer();
					$timeout(function() {
						if( loaded[url].success ) {
							deferred.resolve(loaded[url].result);
						} else {
							deferred.reject(loaded[url].result);
						}
					});
				}
			}
			return deferred.promise;
		}
	};
	return service;
}]);
