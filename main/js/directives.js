/**
 * Loads and shows a partial within the element containing the sl-partial directive.
 */
angular.module('sl').directive('slPartial', ['partials','$compile', function(partials,$compile) {
	var slPartialDirective = {
		restrict:'A',
		link:function(scope, element, attrs) {
			var partial = attrs.slPartial;
			if( partial != '' ) {
				partials.load(partial).then(function(content) {
					element.html(content);
					$compile(element.contents())(scope);
				});
			}
		}
	};
	return slPartialDirective;
}]);
