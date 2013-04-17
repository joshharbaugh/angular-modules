angular.module('sl.ui.elements').controller('CheckboxCtrl', ['$scope','$attrs', function($scope,$attrs) {
	console.log('Attributes:',$attrs);
	this.reset = function() {
		console.log('resetting');
	};
}]);