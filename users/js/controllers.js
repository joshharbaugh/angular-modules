angular.module('sl.users').controller('UserGroupsCtrl', ['$scope','groups','$timeout', function($scope,groups,$timeout) {
	
	var errorPromise = null;
	var alertPromise = null;
	var promise = groups.load();
	if(angular.isArray(promise)) {
		$scope.groups = promise;
	} else {
		promise.then(function(data) {
        	$scope.groups = data;
	    }, function(reason) {});
	}

	$scope.$watch('groups', function(newValue, oldValue) {
		if(newValue) {
			setGroupName(newValue);
		}
	});

	function setGroupName(data) {
		angular.forEach(data, function(group) {
			if ( $scope.$parent.group == group.id ) {
				$scope.group = group.name;
			}
		});
	}
	
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
	
	function alert(msg) {
		if( alertPromise != null ) {
			$timeout.cancel(alertPromise);
		}
		$scope.alert = msg;
		alertPromise = $timeout(function() {
			alertPromise = null;
			$scope.alert = '';
		}, 5000);
	}

	$scope.createGroup = function() {
		var newGroup = $scope.newGroup;
		var payload = {"name": newGroup};
		groups.create(payload).then(function(saved) {
			if(saved) {
				$scope.newGroup = '';
				alert("Group created successfully");
				$scope.$broadcast('/groups/:add');
			}
		}, function(reason) {
			console && console.error && console.error('Create group failed: ', reason);
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

angular.module('sl.users').controller('UserRolesCtrl', ['$scope','roles','$timeout', function($scope,roles,$timeout) {

	var promise = roles.load();
	if(angular.isArray(promise)) {
		$scope.roles = promise;
	} else {
		promise.then(function(data) {
        	$scope.roles = data;
	    }, function(reason) {});
	}

	$scope.$watch('roles', function(newValue, oldValue) {
		if(newValue) {
			setRoleName(newValue);
		}
	});

	function setRoleName(data) {
		angular.forEach(data, function(role) {
			if ( $scope.$parent.role == role.id ) {
				$scope.role = role.name;
			}
		});
	}

}]);

angular.module('sl.users').controller('EditUserCtrl', ['$scope','$timeout','$rootScope','routing','users', function($scope,$timeout,$rootScope,routing,users) {
	
	var userId = routing.get().split('/').pop();
	var errorPromise = null;
	var alertPromise = null;
	var promise = users.load();
	if(angular.isArray(promise)) {
		$scope.users = promise;
	} else {
		promise.then(function(data) {
        	$scope.users = data;
	    }, function(reason) {});
	}

	$scope.$watch('users', function(newValue, oldValue) {
		if(newValue) {
			$scope.users = newValue;
			setCurrentUser($scope.users);
		}
	});

	$scope.$watch('user', function(newValue, oldValue) {
		if(newValue) {
			$scope.userRoles = $scope.user.roles;
			$scope.userGroups = $scope.user.groups;
		}
	});

	function setCurrentUser(data) {
		angular.forEach(data, function(user) {
			if ( userId == user.id ) {
				$scope.user = user;
			}
		});
	};
	
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

	function alert(msg) {
		if( alertPromise != null ) {
			$timeout.cancel(alertPromise);
		}
		$scope.alert = msg;
		alertPromise = $timeout(function() {
			alertPromise = null;
			$scope.alert = '';
		}, 5000);
	}
	
	$scope.saveUser = function() {
		$scope.$broadcast('savingUser', {user:$scope.context});
		var payload = {"id": $scope.user.id, "email": $scope.user.email, "password": $scope.user.password, "groupIds": $scope.user.groups, "roleIds": $scope.user.roles, "enabled": $scope.user.enabled};
		users.update(payload).then(function(saved) {
			$scope.$broadcast('savedUser', {user:$scope.context});
			alert("User saved!");
			$scope.userSaved = true;			
			$timeout(function() {
				try {
					routing.set('/users');
					$scope.closeDialog();
				} catch( e ) {
					// Wasn't a dialog ...
				}
			}, 800);
		}, function(reason) {
			console && console.error && console.error('Save user failed: ', reason);
			error(reason);
		});
	};

	$scope.removeUserFromGroup = function(id) {
		for( var i=$scope.user.groups.length-1; i >= 0; i-- ) {
			if( $scope.user.groups[i] == id ) {
				$scope.user.groups.splice(i, 1);
			}
		}
	};

	$scope.addUserToGroup = function() {
		$scope.groups = JSON.parse(localStorage["groups"]);
		angular.forEach($scope.user.groups, function(value) {
			var groupName = null;
			for( var i=0; i < $scope.groups.length; i++ ) {
				if (value == $scope.groups[i].id) {
					groupName = $scope.groups[i].name;
				}
			}
			if ($scope.typeaheadGroups == groupName) {
				error('User already in that group.');
				return;
			}
		});
		angular.forEach($scope.groups, function(value) {
			if ( $scope.typeaheadGroups == value.name && $scope.user.groups.indexOf(value.id) == -1 ) {
				$scope.user.groups.push(value.id);
			}
		});
		$scope.typeaheadGroups = '';
	};
	
	$scope.removeRoleFromUser = function(id) {
		for( var i=$scope.user.roles.length-1; i >= 0; i-- ) {
			if( $scope.user.roles[i] == id ) {
				$scope.user.roles.splice(i, 1);
			}
		}
	};

	$scope.addRoleToUser = function() {
		$scope.roles = JSON.parse(localStorage["roles"]);
		angular.forEach($scope.user.roles, function(value) {
			var roleName = null;
			for( var i=0; i < $scope.roles.length; i++ ) {
				if (value == $scope.roles[i].id) {
					roleName = $scope.roles[i].name;
				}
			}
			if ($scope.typeaheadRoles == roleName) {
				error('User already has that role.');
				return;
			}
		});
		angular.forEach($scope.roles, function(value) {
			if ( $scope.typeaheadRoles === value.name && $scope.user.roles.indexOf(value.id) == -1  ) {
				$scope.user.roles.push(value.id);
			}
		});
		$scope.typeaheadRoles = '';
	};
}]);

angular.module('sl.users').controller('AddUserCtrl', ['$scope','users','$timeout','$element','$rootScope','routing', function($scope,users,$timeout,$element,$rootScope,routing) {
	
	var errorPromise = null;

	$scope.newRowGroups = [];
	$scope.newRowRoles = [];
	$scope.updatedGroups = [];
	$scope.updatedRoles = [];

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

	$scope.addUser = function() {
		var newUsername = $element.find('#newUsername').val();
		var newPassword = $element.find('#newPassword').val();
		$scope.addedGroups = $scope.updatedGroups;
		$scope.addedRoles = $scope.updatedRoles;
		var payload = {"email": newUsername, "password": newPassword, "groupIds": $scope.newRowGroups, "roleIds": $scope.newRowRoles, "enabled": true};
		users.create(payload).then(function(saved) {
			$timeout(function() {
				try {
					routing.set('/users');
					$scope.closeDialog();
				} catch( e ) {
					// Wasn't a dialog ...
				}
			}, 800);
		}, function(reason) {
			console && console.error && console.error('Add user failed: ', reason);
			error(reason);
		});
	};

	$scope.removeUserFromGroup = function(id) {
		for( var i=$scope.newRowGroups.length-1; i >= 0; i-- ) {
			if( $scope.newRowGroups[i] == id ) {
				$scope.newRowGroups.splice(i, 1);
			}
		}
	};

	$scope.addUserToGroup = function() {
		$scope.groups = JSON.parse(localStorage["groups"]);
		angular.forEach($scope.newRowGroups, function(value) {
			var groupName = null;
			for( var i=0; i < $scope.groups.length; i++ ) {
				if (value == $scope.groups[i].id) {
					groupName = $scope.groups[i].name;
				}
			}
			if ($scope.typeaheadGroups == groupName) {
				error('User already in that group.');
				return;
			}
		});
		angular.forEach($scope.groups, function(value) {
			if ( $scope.typeaheadGroups == value.name && $scope.newRowGroups.indexOf(value.id) == -1 ) {
				$scope.newRowGroups.push(value.id);
			}
		});
		$scope.typeaheadGroups = '';
	};
	
	$scope.removeRoleFromUser = function(id) {
		for( var i=$scope.newRowRoles.length-1; i >= 0; i-- ) {
			if( $scope.newRowRoles[i] == id ) {
				$scope.newRowRoles.splice(i, 1);
			}
		}
	};

	$scope.addRoleToUser = function() {
		$scope.roles = JSON.parse(localStorage["roles"]);
		angular.forEach($scope.newRowRoles, function(value) {
			var roleName = null;
			for( var i=0; i < $scope.roles.length; i++ ) {
				if (value == $scope.roles[i].id) {
					roleName = $scope.roles[i].name;
				}
			}
			if ($scope.typeaheadRoles == roleName) {
				error('User already has that role.');
				return;
			}
		});
		angular.forEach($scope.roles, function(value) {
			if ( $scope.typeaheadRoles === value.name && $scope.newRowRoles.indexOf(value.id) == -1  ) {
				$scope.newRowRoles.push(value.id);
			}
		});
		$scope.typeaheadRoles = '';
	};
}]);