angular.module('sl.notifications').service('notifications', ['store',function(store) {
	var notifications = {};
	
	var storeService = store.getService('notifications');

	var service = {
		notify : function(options) {
			if( !jQuery.isPlainObject(options) ) {
				options = {text:options};
			} else {
				options = jQuery.extend({}, options);
			}
			if( typeof options.location == 'undefined' ) {
				options.location = 'main';
			}
		}
	};
	return service;
}]);