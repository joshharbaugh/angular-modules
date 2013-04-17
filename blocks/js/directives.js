angular.module('sl.blocks').directive('slContainer', ['blocks','routing','partials','$compile','$timeout', function(blocks,routing,partials,$compile,$timeout) {
	var priority = 1000;
	
	function loadBlock(scope, element, params, showing) {
		var blockPriority = -1;
		if( typeof params.priority != 'undefined' ) {
			blockPriority = params.priority;
		} else {
			blockPriority = priority++;
		}
		var $div = jQuery('<div/>');
		$div.attr('data-priority', blockPriority);
		element.append($div);
		if( typeof params.partial != 'undefined' ) {
			partials.load(params.partial).then(function(data) {
				showing.push({id:params.___id,params:params});
				$div.html(data);
				$compile($div.contents())(scope);
				if( typeof params.onShow != 'undefined' ) {
					params.onShow(scope);
				}
			}, function(reason) {
				console && console.error && console.error('ERROR GETTING PARTIAL', params.partial, 'Reason:', reason);
				
			});
		}
	}
	function showBlocks(scope, element, registered, layout, showing) {
		element.empty();
		var current = routing.get();
		for( var i=0; i < registered.length; i++ ) {
			var show = false;
			if( typeof registered[i].url != 'undefined' ) {
				var isMatch = false;
				if( jQuery.type(registered[i].url) != 'regexp' ) {
					isMatch = registered[i].url == current;
				} else {
					isMatch = !!current.match(registered[i].url);
				}
				show = isMatch;
			} else {
				show = true;
			}
			if( show ) {
				loadBlock(scope, element, registered[i], showing);
			}
		}
	}
	
	return {
		restrict:'A',
		link: function (scope, element, attrs) {
			var showing = [];
			var params = {location:attrs['slContainer'],layout:'single'};
			try {
				params = JSON.parse(params.location);
			} catch(e) {
				// parsing failed ... oh well
			}
			if( typeof params.location == 'undefined' ) {
				return;
			}
			
			
			var location = params.location;
			if( location != '' ) {
				function doShow() {
					var registered = blocks.getRegistered(location);
					var db = TAFFY(registered);
					console && console.log && console.log('blocks.doShow() - location', location);
					for( var i=0; i < showing.length; i++ ) {
						if( db(showing[i].id).count() == 0 ) {
							if( typeof showing[i].params.onHide != 'undefined' ) {
								try {
									showing[i].params.onHide(scope, params);
								} catch(e) {
									console && console.error && console.error('blocks.onHide Failure:', params, e);
								}
							}
						}
					}
					showing = [];
					showBlocks(scope, element, registered, params.layout, showing);
				}
				routing.register(doShow);
			}
		}
	};
}]);

