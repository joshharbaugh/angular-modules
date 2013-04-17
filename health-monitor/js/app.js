'use strict';


// Declare app level module which depends on filters, and services
angular.module('sl.healthmonitor', ['sl.healthmonitor.filters', 'sl.healthmonitor.services', 'sl.healthmonitor.directives', 'sl']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/:month', {templateUrl: 'partials/main.html', controller: InvoicingMain});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);


Number.prototype.formatMoney = function(c, d, t){
var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

