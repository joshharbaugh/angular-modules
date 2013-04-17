/**
 * Table Lists.
 * The value of the directive must be the name of the service
 * providing the data for the table.
 * 
 * The service must have at least load() and remove(payload) functions.
 * 
 * @uses $injector for retrieving the specified service
 * @uses $compile to generate the table that uses the ng-grid module
 * @namespace sl.ui.table
 */
angular.module('sl.ui.table').directive('slTableList', ['$injector','$compile','$filter','$timeout','$rootScope', function($injector,$compile,$filter,$timeout,$rootScope) {

	var slTableListDirective = {
		restrict: 'A',
		controller: 'TableListCtrl',
		scope:true,
		link: function(scope, element, attrs) {

			scope.$watch('tableData', function(data, oldData) {
				if(data) {
					console.log("tableData", data);
					try {
						scope.tableData = data;
			    		scope.filteredData = scope.tableData;

			    		// Return paged data
			    		scope.tableData = scope.getPagedDataAsync(scope.pagingOptions.pageSize, scope.pagingOptions.currentPage, data);
			    		
			    		scope.$watch('pagingOptions', function() {
							scope.getPagedDataAsync(scope.pagingOptions.pageSize, scope.pagingOptions.currentPage, data);
						}, true);
			    		
			    		$rootScope.$on('query', function(event) {
			    			console.log(event, data);
							scope.filterData(event, data);
							if(!scope.$$phase) {
								scope.$digest();
							}
						});

			    		// Default config
			    		scope.options = {
			    			data: 'filteredData',
			    			selectedItems: scope.selectedRows,
			    			selectWithCheckboxOnly: true,
			    			watchDataItems: true,
			    			enablePaging: true,
			    			showGroupPanel: false,
			    			pagingOptions: scope.pagingOptions
			    		};

			    		// Custom config options
			    		if ( typeof scope.customOptions != 'undefined' ) {
			    			angular.extend(scope.options, scope.customOptions);
				    	}

			    		if ( typeof scope.filteredData != 'undefined' && scope.filteredData.length > 0 ) {
			    			console.log("Compile the ng-grid table");
			    			element.html('<table ng-grid="options" ng-model="tableData" class="table table-striped table-hover" style="float:left;margin-top:20px;"></table>');
				        	$compile(element.contents())(scope);
				        } else {
				        	element.html('<div class="ajax-loading ajax-loading-well well"></div>');
				        }

			    	} catch (e) {}
			    }
			});
		}
    };
    return slTableListDirective;

}]);

angular.module('sl.ui.table').directive('slUsersTableList', ['$compile', function($compile) {

	var slUsersTableListDirective = {
		restrict: 'A',
		scope:true,
		link: function(scope, element, attrs) {
			scope.customOptions =  {
				columnDefs: [
    				{field: 'id', displayName: 'ID'},
    				{field: 'email', displayName: 'Username'},
    				{field: 'enabled', displayName: 'Enabled', cellTemplate: '<div sl-checkbox-wrapper="delay"></div>'},
    				{field: 'groups', displayName: 'Groups', cellTemplate: '<span class="label pull-left" ng-repeat="group in row.entity[\'groups\']" data-ng-controller="UserGroupsCtrl">{{group}}</span>'},
    				{field: 'roles', displayName: 'Roles', cellTemplate: '<span class="label pull-left" ng-repeat="role in row.entity[\'roles\']" data-ng-controller="UserRolesCtrl">{{role}}</span>'}
    			]
			};
			element.html('<div sl-table-list="users" data-items-per-page="100"></div>');
			$compile(element.contents())(scope);
		}
	};
	return slUsersTableListDirective;

}]);

angular.module('sl.ui.table').directive('slUserGroupsTableList', ['$compile', function($compile) {

	var slUserGroupsTableListDirective = {
		restrict: 'A',
		link: function(scope, element, attrs) {
			scope.customOptions =  {
				displaySelectionCheckbox: false,
				displayEditButton: false,
				columnDefs: [
    				{field: 'id', displayName: 'ID'},
    				{field: 'name', displayName: 'Name'}
    			]
			};
			element.html('<div sl-table-list="groups" data-items-per-page="5"></div>');
			$compile(element.contents())(scope);
		}
	};
	return slUserGroupsTableListDirective;

}]);

angular.module('sl.ui.table').directive('slPermissionsTableList', ['$compile', function($compile) {

	var slPermissionsTableListDirective = {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			var customRowTemplate = '<td ng-repeat="col in visibleColumns()" class="column{{$index}}"><h5 ng-show="$index == 0 && row.entity[\'parent\']">{{row.entity[\'parent\']}}</h5><h5 ng-show="$index == 0 && !row.entity[\'parent\']">{{row.entity[col.field]}}</h5><div ng-hide="$index == 0" sl-checkbox-wrapper></div></td>';
			scope.customOptions =  {
				displaySelectionCheckbox: false,
				groups: ['groupBy'],
				hiddenColumns: ['groupBy','parent'],
				rowTemplate: customRowTemplate
			};
			element.html('<div sl-table-list="permissions"></div>');
			$compile(element.contents())(scope);
		}
	};
	return slPermissionsTableListDirective;

}]);

angular.module('sl.ui.table').directive('slUserPermissionsTableList', ['$compile', function($compile) {

	var slUserPermissionsTableListDirective = {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			var userRoles = scope.$eval(attrs['slUserPermissionsTableList']);
			
			columns = [{field: 'name', displayName: 'Name'}];
			angular.forEach(userRoles, function(role, i) {
				columns.push({field: role, displayName: role, cellTemplate: '<div sl-checkbox-wrapper="disabled"></div>'});
			});

			scope.customOptions =  {
				displaySelectionCheckbox: false,
				displayEditButton: false,
				displayDeleteButton: false,
				columnDefs: columns
			};
			element.html('<div sl-table-list="permissions"></div>');
			$compile(element.contents())(scope);
		}
	};
	return slUserPermissionsTableListDirective;

}]);