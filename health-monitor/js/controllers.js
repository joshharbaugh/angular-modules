'use strict';

/* Controllers */

function InvoicingMain($rootScope, $scope, $routeParams, $filter,
		$timeout, $window, Invoicing, jqueryUI) {
	function digest() {
		try {
			$scope.$digest();
		} catch( e ) {
		}
	}

	$scope.updateNow = function() {

		$scope.pleaseWait++;
		Invoicing.updateNow({}, function(result) {
			var msg = '';
			if( !result.success ) {
				if( typeof result.data.errors.join != 'undefined' ) {
					msg = result.data.errors.join(', ');
				} else {
					msg = result.data.errors;
				}
			}
			$scope.pleaseWait = 0;
			setInvoices(result.data.invoices);
		});
	};

	$scope.failedClass = function(syncResult) {
		if( syncResult === false ) {
			return 'not_run';
		}
		try {
			if( syncResult.sync_info.indexOf('old budget system') >= 0 ) {
				return 'old_system';
			}
		} catch( e ) {
		}
		return '';
	};

	$scope.showSyncError = function(invoice) {
		var buttons = {
			'Mark Resolved': function() {
				$scope.pleaseWait++;
				Invoicing.resolve({id:invoice.id}, function(result) {
					$scope.pleaseWait = 0;

					if( result.success ) {
						var newInvoice = result.data;
						for( var key in newInvoice ) {
							invoice[key] = newInvoice[key];
						}
					} else {
						$scope.error = result.data;
					}

					digest();
				});

				jQuery(this).dialog('close');
			},
			Cancel: function() {
				jQuery(this).dialog('close');
			}
		};

		var hasPermission = false;
		if( $scope.permissions.set === true ) {
			hasPermission = true;
		} else if( jQuery.isArray($scope.permissions.set) ) {
			if( jQuery.inArray(invoice.dealer_id, $scope.permissions.set) ) {
				hasPermission = true;
			}
		}

		if( !hasPermission ) {
			buttons = {
				'Close':function() {
					jQuery(this).dialog('close');
				}
			};
		}

		var options = {
			modal:true,
			buttons:buttons
		};

		$scope.syncError = invoice.syncResult.sync_info;

		jqueryUI.wrapper('#syncErrorDialog', 'dialog', options);
	};

	var moneyCols = ['starting_balance','budget_amount','adwords_amount','reported_amount',
		'google_invoice_amount','adjustments','ending_balance'];
	$scope.totals = {};
	for( var i=0; i < moneyCols.length; i++ ) {
		$scope.totals[moneyCols[i]] = '?';
	}
	$scope.colTotal = function(col) {

		if( typeof $scope.totals[col] != 'undefined' )
			return $scope.totals[col];

		return null;

	};

	$scope.editing = {};
	$scope.edit = function(id, field, $event) {
		$scope.editing = {id:id, field:field};
		try {
			if( typeof $event != 'undefined' ) {
				$event.stopImmediatePropagation();
			}
		} catch(e) {
		}
		if( field == 'approved' ) {
			if( $scope.permissions.authorize ) {
				var invoice = null;
				for( var i=0; i < $scope.invoices.length; i++ ) {
					if( $scope.invoices[i].id == id ) {
						invoice = $scope.invoices[i];
					}
				}
				if( invoice != null ) {
					var editedValue = null;
					if( invoice.approved == null || invoice.approved == '' ) {
						editedValue = true;
					}
					console && console.log && console.log('saving approval status', editedValue);
					$scope.saveInvoice(editedValue, $event);
				} else {
					console && console.log && console.log('?? No Invoice ??');
				}
			} else {
				console && console.log && console.log('No "authorize" permission.');
			}
		}
		digest();
	};
	$scope.cancelEdit = function($event) {
		try {
			if( typeof $event != 'undefined' ) {
				$event.stopImmediatePropagation();
			}
		} catch( e ) {
		}
		$scope.edit(false);
	};
	
	$scope.pleaseWait = 0;
	$scope.saveInvoice = function(editedValue, $event) {
		if( !$scope.permissions.set ) {
			$scope.error = 'You do not have sufficient privileges to save';
		} else {
			var invoiceId = $scope.editing.id;
			var invoiceField = $scope.editing.field;

			var invoice = null;
			for( var i=0; i < $scope.invoices.length; i++ ) {
				if( $scope.invoices[i].id == invoiceId ) {
					invoice = $scope.invoices[i];
				}
			}

			if( invoice == null ) {
				$scope.error = 'There was a problem finding the invoice.';
			} else if( editedValue == invoice[invoiceField] ) {
				$scope.error = 'Nothing changed.';
			} else {
				$scope.error = '';

				$scope.pleaseWait++;
				
				var edited = {};
				edited.id = invoiceId;
				edited[invoiceField] = editedValue;
				Invoicing.save({
					invoices:[edited]
				}, function(result) {
					
					$scope.pleaseWait = 0;

					if( result.success ) {
						var newInvoice = result.data;
						for( var key in newInvoice ) {
							invoice[key] = newInvoice[key];
						}
					} else {
						$scope.error = result.data;
					}

					$scope.cancelEdit($event);
					digest();
				});
			}

		}
	};
	
	var columnDetails = {
		dealer_name : {
			display:'Dealer',
			editable:false
		},
		dealer_vendor : {
			display:'Vend',
			editable:false,
			filter:'abbreviator'
		},
		rep : {
			display:'Rep',
			editable:false
		},
		adwords_id : {
			display:'ClientID',
			editable:false,
			filter:'adwordsid'
		},
		starting_balance : {
			display:'Initial',
			filter:'currency',
			editable:false
		},
		payment_received_date : {
			display:'Rcvd',
			editable:'date',
			filter:'localdate',
			format:'MMM d'
		},
		budget_amount : {
			display:'Budget',
			editable:false,
			filter:'currencyblanks'
		},
		adwords_amount : {
			display:'AdWords',
			editable:false,
			filter:'currencyblanks'
		},
		reported_amount : {
			display:'Spend',
			editable:false,
			filter:'currencyblanks'
		},
		google_invoice_amount : {
			display:'Billed',
			editable:'currency',
			filter:'currencyblanks'
		},
		adjustments : {
			display:'Adjust',
			editable:'currency',
			filter:'currencyblanks'
		},
		comments : {
			display:'Comments',
			editable:'longtext'
		},
		ending_balance : {
			display:'Balance',
			editable:false,
			filter:'currency'
		},
		approved : {
			display:'Aprvd',
			editable:'authorize',
			filter:'localdate',
			format:'MMM dd'
		}
	};
	var columns = [];
	for( var key in columnDetails ) {
		var details = columnDetails[key];
		details.key = key;
		columns.push(details);
	}
	$scope.columns = columns;
	
	$scope.dateValue = function(str) {
		var dt = new Date();
		if( str != null && str != '' ) {
			dt = parseDate(str);
		}
		return dt;
	};
	
	$scope.invoiceFilter = function(text, field) {
		var details = columnDetails[field];
		if( typeof details.filter != 'undefined' ) {
			var filter = $filter(details.filter);
			if( typeof details.format != 'undefined' ) {
				return filter(text, details.format);
			} else {
				return filter(text);
			}
		}
		return text;
	};
	
	var month = $routeParams.month;
	if( !month.match(/\d{4}-\d{2}/) ) {
		month = new Date().format('Y-m');
	}
	month = parseDate(month+'-01');
	$scope.month = month.format('Y-m');
	if( $scope.month == (new Date().format('Y-m')) ) {
		$scope.monthend = (new Date().format('Y-m-d'));
	} else {
		$scope.monthend = month.format('Y-m-t');
	}
	
	$scope.prevmonth = month.addMonths(-1).format('Y-m');
	$scope.nextmonth = month.addMonths(1).format('Y-m');
	
	var thismonth = new Date().format('Y-m');
	var nextmonth = new Date().addMonths(1).format('Y-m');
	if( $scope.prevmonth == thismonth )
		$scope.prevmonth = '';
	if( $scope.nextmonth == thismonth )
		$scope.nextmonth = '';
	
	$scope.showNextMonth = nextmonth >= $scope.nextmonth;

	$scope.showUpdateNow = thismonth == $scope.month;

	for( var k in columnDetails ) {
		columnDetails[k]._editable = columnDetails[k].editable;
	}
	
	$scope.editable = function(col, invoice) {
		if( !col.editable ) {
			return false;
		} else if( typeof $scope.permissions.set == 'undefined' ) {
			return false;
		} else if( $scope.permissions.set === false ) {
			return false;
		} else if( $scope.permissions.set === true ) {
			return true;
		} else {
			return typeof $scope.permissions.set[invoice.dealer_id] != 'undefined';
		}
	}
	
	$scope.permissions = Invoicing.permissions({}, function(data) {
		if( data.success ) {
			$scope.permissions = data.data;
			if( $scope.permissions.set !== true && $scope.permissions.set !== false ) {
				var dealer_ids = {};
				for( var i=0; i < $scope.permissions.set.length; i++ ) {
					dealer_ids[$scope.permissions.set[i]+''] = true;
				}
				$scope.permissions.set = dealer_ids;
			}
		} else {
			$scope.permissions = {get:false,set:false,authorize:false};
			$scope.error = data.data;
		}
		if( !$scope.permissions.get ) {
			$scope.columns = [];
		} else if( !$scope.permissions.set ) {
			for( var key in columnDetails ) {
				columnDetails[key].editable = false;
			}
		} else if( !$scope.permissions.authorize ) {
			columnDetails.approved.editable = false;
		}
	});
	
	$scope.loadingInvoices = true;
	$scope.invoices = Invoicing.get({month:$scope.month}, function(data) {
		if( !data.success ) {
			if( $.isArray(data.data) ) {
				if( data.data.length == 0 ) {
					$scope.error = 'Could not get invoicing data for '+$scope.month;
				} else {
					$scope.error = data.data.join(', ');
				}
			} else if( $.isPlainObject(data.data) ) {
				$scope.error = JSON.stringify(data.data);
			} else {
				$scope.error = data.data;
			}
			data.data = [];
		} else {
			$scope.error = '';
		}
		$scope.loadingInvoices = false;
		setInvoices(data.data);
		
	});

	function setInvoices(invoices) {
		$scope.pleaseWait++;
		$scope.invoices = [];
		var batchCount = 5;
		var idx = 0;
		(function nextBatch() {
			if( idx < invoices.length ) {
				for( var i=0; i < batchCount; i++ ) {
					if( idx < invoices.length ) {
						$scope.invoices.push(invoices[idx]);
					}
					idx++;
				}
				$scope.$emit('invoicesChanged');
				$timeout(nextBatch, 10);
			} else {
				$scope.pleaseWait = 0;
			}
		})();
	}

	$scope.$on('invoicesChanged', function() {
		for( var i=0; i < moneyCols.length; i++ ) {
			var col = moneyCols[i];
			var total = 0;
			for( var j=0; j < $scope.invoices.length; j++ ) {
				var invoice = $scope.invoices[j];
				if( typeof invoice[col] != 'undefined' ) {
					var val = parseFloat(invoice[col]);
					if( !isNaN(val) ) {
						total += val;
					}
				}
			}

			$scope.totals[col] = '$'+total.formatMoney(2, '.', ',');
		}

		sortInvoices();

	});

	$scope.invoiceClass = function(invoice) {
		var cls = '';
		if( invoice.ending_balance <= 0 ) {
			cls += ' no-budget';
		}
		
		if( invoice.google_invoice_amount == null ) {
			cls += ' billing-required';
		}
		
		if( invoice.approved == null ) {
			cls += ' approval-required';
		}

		return cls;
	};
	
	$scope.$watch('searchterm', function() {
		if( typeof $scope.searchterm == 'undefined' || $scope.searchterm == '' ) {
			for( var i=0; i < $scope.invoices.length; i++ ) {
				$scope.invoices[i].hide = false;
			}
		} else {
			var caseSensitive = $scope.searchterm.toLowerCase() != $scope.searchterm;
			var adwords_id_search = $scope.searchterm.replace(/-/g, '');
			for( var i=0; i < $scope.invoices.length; i++ ) {
				var invoice = $scope.invoices[i];
				var match = false;
				for( var key in columnDetails ) {
					var searchterm = $scope.searchterm;
					if( typeof invoice[key] != 'undefined' &&
							invoice[key] != null ) {
						var val = ''+invoice[key];
						if( !caseSensitive )
							val = val.toLowerCase();
						if( val.indexOf(searchterm) >= 0 ) {
							match = true;
							break;
						}
						
						var displayVal = $scope.invoiceFilter(invoice[key], key);
						if( !caseSensitive )
							displayVal = displayVal.toLowerCase();
						if( displayVal.indexOf(searchterm) >= 0 ) {
							match = true;
							break;
						}
					}
				}
				invoice.hide = !match;
			}
		}
	});
	
	$scope.$watch('loadingInvoices', function() {
		if( !$scope.loadingInvoices ) {
			sortInvoices();
			
			// Let the filters do their thing, then remove the loading class
			setTimeout(function() {
				$('#invoice-history-container').removeClass('loading');
			});
		} else {
			$('#invoice-history-container').addClass('loading');
		}
	});
	
	$scope.$watch('editing', function() {
		$timeout(function() {
			var viewport = {
				top:$($window).scrollTop(),
				left:$($window).scrollLeft()
			};
			viewport.bottom = viewport.top + $($window).height();
			viewport.right = viewport.left + $($window).width();
			
			$('.editing:visible').each(function() {
				var position = $(this).offset();
				var bounds = {
					top:position.top,
					left:position.left,
					bottom:position.top+$(this).outerHeight(),
					right:position.left+$(this).outerWidth()
				};
				
				var deltax = 0;
				var deltay = 0;
				if( bounds.top < viewport.top ) {
					deltay = viewport.top-bounds.top;
				} else if( bounds.bottom > viewport.bottom ) {
					deltay = viewport.bottom - bounds.bottom;
				}
				if( bounds.left < viewport.left ) {
					deltax = viewport.left - bounds.left;
				} else if( bounds.right > viewport.right ) {
					deltax = viewport.right - bounds.right;
				}
				
				if( deltax != 0 ) {
					$(this).css({
						left:parseInt($(this).css('left'))+deltax
					});
				}
				if( deltay != 0 ) {
					$(this).css({
						top:parseInt($(this).css('top'))+deltay
					});
				}
				
			});
		});
	});
	
	function sortInvoices() {
		if( typeof $scope.sortedBy == 'undefined' ) {
			$scope.sortedBy = 'dealer_name';
			$scope.asc = true;
		}
		
		$scope.invoices.sort(function(a,b) {
			if( a[$scope.sortedBy] == b[$scope.sortedBy] )
				return 0;
			else if( a[$scope.sortedBy] < b[$scope.sortedBy] )
				return $scope.asc ? -1 : 1;
			else
				return $scope.asc ? 1 : -1;
		});
	}
	
	$scope.sortBy = function(field) {
		if( $scope.sortedBy == field ) {
			$scope.asc = !$scope.asc;
			$scope.invoices.reverse();
		} else {
			$scope.sortedBy = field;
			sortInvoices();
		}
	};
	
	$scope.colIcon = function(field) {
		if( $scope.sortedBy != field )
			return '';
		else if( $scope.asc )
			return 'sort-asc';
		else
			return 'sort-desc';
	};
}
InvoicingMain.$inject = ['$rootScope', '$scope', '$routeParams', '$filter', '$timeout', '$window', 'Invoicing', 'jqueryUI'];

