angular.module('sl.server').service('server', ['$http', '$q', '$rootScope', 'session', function($http, $q, $rootScope, session) {
	
	var httpRoot = "/api/";

	var deferredRequests = [];

	$rootScope.$on('session/opened', function(event) {
		
		// Re-submit all the deferred Requests
		for (var i = 0; i < deferredRequests.length; i++) {
			var config = deferredRequests[i].config;
			var deferred = deferredRequests[i].deferred;
			
			var url = config.url.replace(httpRoot, '');

			service.request(url, config.data).then(
				function(data, requestTime) {
					deferred.resolve(data, requestTime);
				}, function(data, errorType, status) {
					deferred.reject(data, errorType, status);
				}
			);
		}

		deferredRequests = [];
   				
	});

	var service = {

		request : function(uri, requestData) { 
			
			if (requestData == undefined)
				requestData = {};

			if (session.getToken() != null) {
				requestData.sessionToken = session.getToken();
			}

			var deferred = $q.defer();
			var url = httpRoot + uri;

			$http({
				method: 'POST',
				url: url,
				data: requestData
			}).success(function(responseData, status, headers, config) {
				if (responseData.success == true) {
					deferred.resolve(responseData);	
				} else if (responseData.success == false) {
					deferred.reject(responseData.data, responseData.errorType, status);
				} else {
					deferred.reject(responseData.data, responseData.errorType, status);
				}
				console.log(config, responseData);
			}).error(function(responseData, status, headers, config) {
				
				if (status == 401) {
					deferredRequests.push({config: config, deferred: deferred});
					session.closeSession();
				} else {
					deferred.reject(responseData.data, 'HTTP Error', status);
				}

				$rootScope.$broadcast('httpError', status);

			});
			return deferred.promise;
		}

	};
	return service;

}]);