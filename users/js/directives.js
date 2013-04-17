angular.module('sl.users').directive('slRolesList', ['roles','$timeout','$rootScope', function(roles,$timeout,$rootScope) {

	var slRolesListDirective = {
		restrict: 'A',
		scope: {
			context: '='
		},
		controller: 'FilterCtrl',
		link: function(scope, element, attrs) {

			var promise = roles.load();

			if(angular.isArray(promise)) {
				init(promise);
			} else {
				promise.then(function(data) {
		        	init(data);
			    }, function(reason) {});
			}

			function init(data) {
				scope.filterContext = [];
				scope.roles = [];

				angular.forEach(data, function(role, i) {
					if (scope.roles.indexOf(role) === -1) {
						scope.roles.push(role);
						scope.filterContext.push(role.id);
					}
				});
			};
		}
	};
	return slRolesListDirective;
}]);

angular.module('sl.users').directive('slGroupsList', ['groups','$timeout','$rootScope', function(groups,$timeout,$rootScope) {
	
	var slGroupsListDirective = {
		restrict: 'A',
		scope: {
			context: '='
		},
		controller: 'FilterCtrl',
		link: function(scope, element, attrs) {

			var promise = groups.load();

			if(angular.isArray(promise)) {
				init(promise);
			} else {
				promise.then(function(data) {
		        	init(data);
			    }, function(reason) {});
			}

			function init(data) {
				scope.filterContext = [];
				scope.groups = [];

				angular.forEach(data, function(group, i) {
					if (scope.groups.indexOf(group) === -1) {
						scope.groups.push(group);
						scope.filterContext.push(group.id);
					}
				});
			};
		}
	};
	return slGroupsListDirective;

}]);