angular.module('sl.ui.table').controller('TableListCtrl', ['$scope','$filter','$attrs','$injector','$element','$rootScope', function($scope,$filter,$attrs,$injector,$element,$rootScope) {

	var service = $injector.get($attrs['slTableList']);
	var itemsPerPage = $attrs['itemsPerPage'] || 25;
	
	$scope.tableData = service.data() || [];
	$scope.selectedRows = [];
	$rootScope.activeFilter = [];
	$rootScope.activeFilterContext = [];
	$scope.pagingOptions = {
		pageSize: itemsPerPage,
		totalServerItems: 0,
		currentPage: 1
	};

	$scope.$on('dataLoaded', function(event, data) {
		console.log("dataLoaded event", event, data);
		if(data) {
			$scope.tableData = data;
		}
	});

	// Search helpers
	var stringMatch = function (haystack, needle) {
	    if (!needle) {
	    	return true;
	    }
	    return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
	};

	var tagMatch = function (haystack, needles) {
		var ret = true;
	    angular.forEach(needles, function(needle) {
	    	if (haystack.indexOf(needle) === -1) {
	    		ret = false;
	    	} else {
	    		ret = true;
	    	}
	    });
	    return ret;
	};

	// Paging
	$scope.getPagedDataAsync = function(pageSize, page, data) {
		var pData = data;
		var pagedData = pData.slice((page - 1) * pageSize, page * pageSize );
		$scope.filteredData = pagedData;
		$scope.pagingOptions.totalServerItems = pData.length;
		$scope.totalPages = Math.ceil($scope.pagingOptions.totalServerItems / pagedData.length);
	};

	// Filtering
	$scope.filterData = function(query, data) {
		if (query) {
			$scope.query = query.targetScope.query;
			$scope.queryContext = query.targetScope.queryContext;
		}
		if($scope.query.length > 0) {
			$scope.filteredData = $filter('filter')(data, function(object) {
				if($scope.query.length > 0) {
					if ($scope.queryContext.length > 1) {
						for (var i = 0; i < $scope.queryContext.length; i++) {
							if (tagMatch(object[$scope.queryContext[i]], $scope.query)) {
								return true;
							}
						}
					} else {
						for (var context in $scope.queryContext) {
							return tagMatch(object[$scope.queryContext[context]], $scope.query);
						}
					}
				}
			});
		} else {
			$scope.filteredData = data;
		}
	};

	// Sorting
	$scope.sort = {}

	$scope.selectedCol = function(column) {
    	return column.displayName == $scope.sort.column && 'active';
	};

	$scope.changeSorting = function(column) {
		column.sort();
        var sort = $scope.sort;
        if (sort.column == column.displayName) {
            sort.desc = !sort.desc;
        } else {
            sort.column = column.displayName;
            sort.desc = false;
        }
    };

    $scope.remove = function(row) {
    	var check = confirm('Are you sure you want to delete this user?');
    	if (check) {
    		console.log("Deleting ID", row.entity.id);
	    	var promise = service.remove(row.entity.id);
			promise.then(function(response) {			
				$scope.$broadcast('/'+$attrs['slTableList']+'/:remove', {row:row.rowIndex});
			}, function(reason) {});
		}
	};

	$scope.removeSelected = function() {
		var check = confirm('Are you sure you want to delete the selected users?');
		if (check) {
			angular.forEach($scope.selectedRows, function(row) {
				setTimeout(function() {
					service.remove({id:row.id}).then(function(response) {}, function(reason) {});
				});
			});

			var $checkboxes = $('tr input.ngSelectionCheckbox');
			angular.forEach($checkboxes, function(v,k) {
				var $this = angular.element(v);
				if( $this.prop("checked") ) {
					$this = angular.element(v);
					$this.parents("tr").remove();
				}
			});
		}
	};

}]);

angular.module('sl.ui.table').controller('FilterCtrl', ['$scope','$rootScope','$attrs', function($scope,$rootScope,$attrs) {

	$scope.toggleFilter = function(value) {

		if ( $rootScope.activeFilter.indexOf(value) !== -1 && $rootScope.activeFilterContext.indexOf($attrs['context']) !== -1) {
			var indexFilter = $rootScope.activeFilter.indexOf(value);
			var indexFilterContext = $rootScope.activeFilterContext.indexOf($attrs['context']);
			$rootScope.activeFilter.splice(indexFilter, 1);
			$rootScope.activeFilterContext.splice(indexFilterContext, 1);
			$scope.query = $rootScope.activeFilter;
			$scope.queryContext = $rootScope.activeFilterContext;
			$scope.$emit('query');
			return;
		}

		angular.forEach($scope.filterContext, function(filter, i) {
			if (filter === value) {
				$rootScope.activeFilter.push(filter);
				$rootScope.activeFilterContext.push($attrs['context']);
			}
		});

		$scope.query = $rootScope.activeFilter;
		$scope.queryContext = $rootScope.activeFilterContext;
		$scope.$emit('query');

	};

}]);