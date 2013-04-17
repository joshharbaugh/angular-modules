angular.module('sl.ui.modal').directive('slDialogModal', ['partials','$compile', function(partials,$compile) {

	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			var showing = false;
			var partial = attr['slDialogModal'];
			element.click(function() {
				if( showing ) {
					return;
				}
				showing = true;
				partials.load(partial).then(function(html) {
					var context = scope.$eval(attr['slDialogContext']);
					var dialogScope = scope.$new();
					dialogScope.context = context;
					dialogScope.closeDialog = function() {
						$div.modal('hide');
					};
					var $div = $('<div/>').appendTo('body');
					$div.addClass('modal fade');
					$div.html(html);
					$compile($div.contents())(dialogScope);
					$div.modal('show');
					$div.on('hidden', function() {
						showing = false;
						$div.remove();
						dialogScope.$destroy();
					});
				});
			});
		}
	};
	return slDialogModalDirective;

}]);