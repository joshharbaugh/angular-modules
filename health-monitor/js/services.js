'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('invoicing.services', ['ngResource']).
  value('version', '0.1').
  factory('Invoicing', function($resource) {
	var date = new Date();
	var month = date.format('Y-m')+'-01';
	
	var url = slogicapp_base+'adlogic/invoiceapi/:func/';
	var defaults = {
		month:month,
		dealer_id:'all',
		userid:auth_userid,
		func:''
	};
	var actions = {
		get : {
			method:'GET',
			params: {
				func:'getInvoices'
			}
		},
		save : {
			method:'POST',
			params: {
				func:'saveInvoices'
			}
		},
		permissions : {
			method:'GET',
			params: {
				func:'permissions'
			}
		},
		resolve : {
			method:'POST',
			params: {
				func:'resolveError',
				id:-1
			}
		},
		updateNow : {
			method:'GET',
			params: {
				func:'updateBudgets'
			}
		}
	};
	return $resource(url, defaults, actions);
  });
