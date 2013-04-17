angular.module('sl.ui.elements').directive('slTypeahead', ['$injector','$compile','$timeout', function($injector,$compile,$timeout) {
	return {
		restrict:'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ngModel) {

			var service = $injector.get(attrs['slTypeahead']);
			var promise = service.load();

			if(angular.isArray(promise)) {
				init(promise);
			} else {
				promise.then(function(data) {
		        	init(data);
			    }, function(reason) {});
			}
			
			function init(data) {
				if(data) {
					scope.typeaheadSource = [];
		        	angular.forEach(data, function(item, i) {
		        		scope.typeaheadSource.push(item.name);
		        	});

		        	var $element = angular.element($(element));

		        	$element.typeahead({
		        		source: scope.typeaheadSource,
		        		updater: function(item) {
		        			scope.$apply(function() {
		        				ngModel.$setViewValue(item);
		        			});
							return item;
						}
					});
				}
			};
		}
	};
}]);

angular.module('sl.ui.elements').directive('slCheckboxWrapper', ['$compile','$timeout', function($compile,$timeout) {
	
	function buildCheckbox(scope, element, attrs) {	
		var checkboxHtml = '<input type="checkbox" name="chbox" />';	
		if (attrs == 'disabled') {
			checkboxHtml = '<input type="checkbox" name="chbox" disabled="disabled" />';
		}
		element.html('<div class="params btn-switch" data-sl-checkbox-switch="row.entity[col.field]" data-true-val="true" data-false-val="false" data-sl-checkbox-parent="row.entity[\'parent\']" data-sl-checkbox-group="col.field" data-sl-checkbox-groupby="row.entity[\'groupBy\']">'+checkboxHtml+'</div>');
		$compile(element.contents())(scope.$new());
	}

	return {
		restrict:'A',
		link: function(scope, element, attrs) {	
			var expr = attrs['slCheckboxWrapper'];
			if( typeof expr != 'undefined' && expr != '' ) {
				$timeout(function() {
					buildCheckbox(scope, element, expr);
				});
			} else {
				buildCheckbox(scope, element, expr);
			}
		}
	};
}]);

angular.module('sl.ui.elements').directive('slCheckboxParent', [function() {
	return {
		restrict:'A',
		priority:1000,
		link: function() {
		}
	};
}]);

angular.module('sl.ui.elements').directive('slCheckboxGroup', [function() {
	return {
		restrict:'A',
		priority:1001,
		link: function() {
		}
	};
}]);
/**
 * jQuery iButton Plugin
 *
 */
angular.module('sl.ui.elements').directive('slCheckboxSwitch', ['$timeout','$injector','$rootScope', function($timeout,$injector,$rootScope) {
	
	var groups = {};
	var skip = false;
	
	function resetParents(group) {
		if( group == '' ) {
			return;
		}
		var selectedCount = 0;
		for( var i=0; i < groups[group].children.length; i++ ) {
			if( groups[group].children[i].find('input').is(':checked') ) {
				selectedCount++;
			}
		}
		
		for( var i=0; i < groups[group].parents.length; i++ ) {
			try {
				var element = groups[group].parents[i];
				element.removeClass('indeterminate');
				var checked = selectedCount > 0;
				if( checked && selectedCount != groups[group].children.length ) {
					element.addClass('indeterminate');
				}
				element.find("input").iButton("toggle", checked);
			} catch(e) {
				// Not an input??
			}
		}
	}
	
	function resetChildren(group, checked) {
		if( group == '' ) {
			return;
		}
		for( var i=0; i < groups[group].children.length; i++ ) {
			var element = groups[group].children[i];
			groups[group].parents[0].removeClass('indeterminate');
			element.removeClass('indeterminate');
			element.find("input").iButton("toggle", checked);
		}
	}

	var slCheckboxSwitchDirective = {
		restrict: 'A',
		priority:1002,
		require: '?ngModel',
		link: function(scope, element, attrs, ngModel) {
			
			var group = (scope.$eval(attrs.slCheckboxGroup)+'-'+scope.$eval(attrs.slCheckboxGroupby)).replace(/ /g, '-');
			var groupParent;
			if ( typeof scope.$eval(attrs.slCheckboxParent) != 'undefined' ) {
				groupParent = scope.$eval(attrs.slCheckboxParent);
			}
			if( group != '' ) {
				if( typeof groups[group] == 'undefined' ) {
					groups[group] = {parents:[],children:[]};
				}
				if( typeof groupParent != 'undefined' ) {
					groups[group].parents.push(element);
					$timeout(function() {
						skip = true;
						resetParents(group);
						skip = false;
					});
				} else {
					groups[group].children.push(element);
				}
			}

			var trueVal = attrs.trueVal || true;
			var falseVal = attrs.falseVal || false;
			var expr = attrs.slCheckboxSwitch;
			var checked = false;
			if( expr != '' ) {
				if ( typeof scope.$eval(expr) != 'undefined' ) {
					// Using an expression
					checked = scope.$eval(expr).toString() == trueVal;
				} else {
					// Using a string
					checked = expr.toString() == trueVal;
				}
				scope.$watch(expr, function(newval) {
					element.iButton('toggle', newval == trueVal);
				});
			}
			try {
				element.find('input')[0].checked = checked;
			} catch(e) {}
			element.iButton({
				labelOn: "",
				labelOff: "",
				enableDrag: false,
				change: function(input) {
					try {
						var value = input[0].checked ? trueVal : falseVal;
						if( jQuery.type(value) != 'boolean' ) {
							value = '"'+value+'"';
						}
						var set = expr + " = " + value;
						scope.$eval(set);
						if( !skip ) {
							skip = true;
							if( groupParent ) {
								resetChildren(group, input[0].checked);
							} else {
								resetParents(group);
							}
							skip = false;
						}
					} catch(e) {}
				}
			});
		}
	};
	return slCheckboxSwitchDirective;

}]);

/**
 * Indeterminate Checkboxes 
 * for Module Permissions
 *
 */
angular.module('sl.ui.elements').directive('slIndeterminateCheckbox', ['$timeout', function($timeout) {
	
	var slIndeterminiateCheckboxDirective = {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$timeout(function() {

				// check for indeterminate states
				if(attrs.status=="indeterminate") {
					element.prop("indeterminate", true).addClass("indeterminate");
				} else if(attrs.status=="inactive") {
					element.prop("checked", false).removeClass("indeterminate");
				} else {
					element.prop("checked", true).removeClass("indeterminate");
				}

				var $check = element;
				$check.data('checked',0).click(function(e) {     
			        var el = $(this);
			                
			        switch(el.data('checked')) {

			            case 0:
			                el.data('checked',2);
			                el.prop('indeterminate',false);
			                el.prop('checked',true);
			                el.removeClass("indeterminate");          
			                break;

			            default:  
			                el.data('checked',0);
			                el.prop('indeterminate',false);
			                el.prop('checked',false);
			                el.removeClass("indeterminate");
			                
			        }
				});
		    });
		}
	};
	return slIndeterminiateCheckboxDirective;

}]);

