'use strict';

/* Filters */

angular.module('invoicing.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('datefromunixtime', ['$filter', function($filter) {
	return function(text,format) {
		if( text != null ) {
			if( typeof text.match != 'undefined' ) {
				if( text.match(/^\d+$/) ) {
					text += '000';
				}
			} else if( typeof text.toFixed != 'undefined' ) {
				text = ''+text+'000';
			}
		}
		return $filter('date')(text,format);
	};
  }]).
  filter('localdate', ['$filter', function($filter) {
	return function(text,format) {
		if( text != null ) {
			if( typeof text.match != 'undefined' ) {
				if( text.match(/^\d{4}-\d{2}$/) ) {
					text += '-01';
				}
				var date = parseDate(text);
				return $filter('date')(date.getTime(),format);
			}
		}
		return '';
	};
  }]).
  filter('adwordsid', function() {
	return function(text) {
		if( text != null ) {
			if( typeof text.replace != 'undefined' ) {
				return text.replace(/(\d{3})-?(\d{3})-?(\d{4})/, '$1-$2-$3');
			}
		}
		return text;
	};
  }).
  filter('currencyblanks', ['$filter', function($filter) {
	  return function(text) {
		  if( text == null )
			  return '';
		  return $filter('currency')(text);
	  }
  }]).
  filter('abbreviator', function() {
	  return function(text) {
		  if( text == null || text.length == 0 )
			  return '';
		  var lc = text.toLowerCase();
	      if( lc == 'homenet' )
		      return 'HN';
		  if( lc == 'showroom' || lc == 'showroom logic' || lc == 'showroomlogic' )
		      return 'SL';

		  return text;
	  }
  });
