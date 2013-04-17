angular.module('sl.navigation').directive('slBreadcrumb', ['breadcrumbs', function(breadcrumbs) {
	function resetBreadcrumbs(element) {
		element.empty();
		var crumbs = breadcrumbs.get();
		for( var i=0; i < crumbs.length; i++ ) {
			var crumb = crumbs[i];
			var $inner = null;
			if( typeof crumb.link != 'undefined' && crumb.link != '' ) {
				$inner = jQuery('<a />');
				$inner.attr('href', '#'+crumb.link);
			} else {
				$inner = jQuery('<span />');
			}
			$inner.text(crumb.label);
			var $li = jQuery('<li />');
			$li.append($inner);
			element.append($li);
		}
	}
	return {
		template:'<ul class="breadcrumb"></ul>',
		replace:true,
		restrict:'A',
		link: function (scope, element, attrs) {
			breadcrumbs.listen(function() {
				resetBreadcrumbs(element);
			});
			resetBreadcrumbs(element);
		}
	};
}]);
