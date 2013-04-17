angular.module('sl.permissions').controller('CreateRoleCtrl', ['$scope','roles','$timeout','$element', function($scope,roles,$timeout,$element) {

	var errorPromise = null;
	function error(msg) {
		if( errorPromise != null ) {
			$timeout.cancel(errorPromise);
		}
		$scope.error = msg;
		errorPromise = $timeout(function() {
			errorPromise = null;
			$scope.error = '';
		}, 5000);
	}
	
	$scope.createRole = function() {
		var newRoleName = $scope.typeaheadModel;
		var payload = {"name": newRoleName};
		roles.create(payload).then(function(created) {
			
		}, function(reason) {
			console && console.error && console.error('Create role failed: ', reason);
			error(reason);
		});
	};

	$scope.done = function() {
		$timeout(function() {
			try {
				$scope.closeDialog();
			} catch( e ) {
				// Wasn't a dialog ...
			}
		}, 800);
	};
}]);

angular.module('sl.permissions').controller('RemoveRoleCtrl', ['$scope','roles','$timeout','$element','$rootScope', function($scope,roles,$timeout,$rootScope,$element) {

	var errorPromise = null;
	function error(msg) {
		if( errorPromise != null ) {
			$timeout.cancel(errorPromise);
		}
		$scope.error = msg;
		errorPromise = $timeout(function() {
			errorPromise = null;
			$scope.error = '';
		}, 5000);
	}
	
	$scope.removeRole = function(id) {
		console.log(id);
		var payload = {"id": id};
		roles.remove(payload).then(function(removed) {
			console.log(removed);
		}, function(reason) {
			console && console.error && console.error('Remove role failed: ', reason);
			error(reason);
		});
	};

	$scope.removeDone = function() {
		$timeout(function() {
			try {
				$scope.closeDialog();
			} catch( e ) {
				// Wasn't a dialog ...
			}
		}, 800);
	};
}]);