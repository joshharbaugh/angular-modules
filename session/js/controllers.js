angular.module('sl.session').controller('SignInBoxCtrl', ['$scope', 'session', 'server', function($scope, session, server) {

	// Listen for notAuthorized event
	$scope.$on('session/closed', function(event) {
		console.log('session closed');
		$scope.showSignInBox();
		$scope.email = session.getLastEmail();
	});

	$scope.$on('session/opened', function(event) {
		$scope.isLoading = false;
		$scope.hideCurtain();
		$scope.hideSignInBox();
	});

	// Form Validation
	$scope.isValid = false;
	$scope.error = null;
	$scope.validate = function() {
		if ($scope.email != '' && $scope.password != '')
			$scope.isValid = true;
		else
			$scope.isValid = false;
	};

	// Hide/Show Sign In Form
	$scope.isLoading = true;
	$scope.signInBoxVisible = false;
	$scope.showSignInBox = function() {
		if ($scope.signInBoxVisible == false) {

			$('#signinHold').keydown(function(event) {
				if (event.which == 13 && $scope.isValid) {
					$('#signin-btn').click();
				}
			});

			$scope.isLoading = false;
			$scope.signInBoxVisible = true;
			$('#application-curtain').show();
			setTimeout(function() {
				$('#signinHold').fadeIn(1000);
				if ($scope.email == null) {
					$('#signin-email').focus();
				} else {
					$('#signin-password').focus();
				}
			}, 500);
		}
	};
	$scope.hideSignInBox = function() {
		if ($scope.signInBoxVisible == true) {
			
			$('#signinHold').unbind('keydown');

			$scope.signInBoxVisible = false;
			$('#signinHold').fadeOut(1000);
		}
	};

	// Hide Curtain
	$scope.hideCurtain = function() {
		$('#application-curtain').fadeOut(1000);
	}

	// Submit the Form
	$scope.submit = function() {
		
		$scope.isLoading = true;
		
		var data = {
			email: $scope.email,
			password: $scope.password,
			test: 'Testing'
		};

		server.request('auth/session/create', data).then(
			function(response) {
				$scope.isLoading = false;
				$scope.hideCurtain();
				session.openSession(response.data.token, response.data.user);
				console.log(response.data);
			}, function(data) {
				$scope.isLoading = false;
				$scope.showSignInBox();
				$scope.error = data;
			}
		);
		
		
	};


}]);

angular.module('sl.session').controller('SessionMenuCtrl', ['$scope', 'session', 'server', function($scope, session, server) {

	$scope.email = null;

	$scope.$on('session/opened', function(event) {
		$scope.email = session.getUser().email;
		$scope.currentUserId = session.getUser().id;
	});

	$scope.logout = function() {
		session.closeSession();
		window.location = '';
	}

}]);