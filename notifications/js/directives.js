angular.module('sl.notifications').directive('slNotifications', ['$compile','notifications', function($compile,notifications) {
	var id = 1000;
	return {
		restrict:'A',
		link: function (scope, element, attrs) {
			var name = null;
			//if( attrs['slNotifications'] )
			element.html('<span class="dropdown notifications" id="menu2"><a class="dropdown-toggle" id="notifyNumber" data-toggle="dropdown" href="#menu2">{{'+attrs['slNotifications']+'Notifications.length}}</a><ul class="dropdown-menu"><li data-ng-repeat="notification in notifications">{{notification}}</li></ul></span>');
			$compile(element.contents())(scope);
		}
	};
}]);