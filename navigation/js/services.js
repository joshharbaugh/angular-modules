/**
 * Defines the navigation module
 *
 * @module navigation
 *
 */

/**
 * Used for notifications when the url changes.
 *
 * Call register(obj) to register a url listener.
 *
 * <em>obj</em> can be:
 * <ol>
 *     <li>a function: called whenever the url changes</li>
 *     <li>an object with at least two keys:<br>
 *         <strong>pattern</strong> (pattern can be a string or a RegExp object) and<br>
 *         <strong>callback</strong> (a function)</li>
 *     <li>an object with patterns as the keys and callback functions as the values</li>
 *     <li>an array of registration objects</li>
 * </ol>
 * The callback function will be called with the registration object as
 * the context (will always be an object with pattern and callback as keys)
 * and will be passed the new url as the first parameter.
 *
 * @class routing
 * @uses $rootScope
 * @uses $location
 * @uses $timeout
 * @namespace sl.navigation
 */
angular.module('sl.navigation').service('routing', ['$rootScope', '$location', '$timeout', function($rootScope, $location, $timeout) {
	var current = null;
	$rootScope.$watch(function() { return $location.url(); }, function() {
		processUrl($location.url());
	});

	function processUrl(url) {
		var split = url.split('?');
		if( split[0][split[0].length-1] != '/' ) {
			split[0] += '/';
		}
		var path = split.shift();
		var query = '';
		while( split.length > 0 ) {
			var piece = split.shift();
			if( piece.length > 0 ) {
				if( query.length > 0 ) {
					query += '&';
				}
				query += piece;
			}
		}
		url = path + (query.length > 0 ? '?'+query : '');
		if( url != current ) {
			current = url;

			// Process the query parameters
			var params = {};
			var querySplit = query.split('&');
			while( querySplit.length > 0 ) {
				var queryPiece = querySplit.shift();
				if( jQuery.trim(queryPiece).length == 0 ) continue;
				var queryPieceSplit = queryPiece.split('=');
				var name = queryPieceSplit[0];
				var value = queryPieceSplit.length > 0 ? queryPieceSplit.join('=') : null;
				params[name] = value;
			}

			for( var i=0; i < registrants.length; i++ ) {
				var match = url.match(registrants[i].pattern);
				if( match && match[0] == url ) {
					try {
						registrants[i].callback.call(registrants[i], path, params);
					} catch(e) {
						console && console.error && console.error('URL Listener Error:', e.message);
						console && console.error && console.error('Listener: ', registrants[i]);
					}
				}
			}
		}
	}

	var registrants = [];
	var navigationService = {
		/**
         * Register a route
         *
         * @method register
         * @for routing
         * @namespace sl.navigation
         * @param {Object} obj
         */
		register:function(obj) {
			if( angular.isFunction(obj) ) {
				navigationService.register({pattern:/.*/,callback:obj});
				return;
			}
			if( angular.isArray(obj) ) {
				for( var i=0; i < obj.length; i++ ) {
					navigationService.register(obj[i]);
				}
				return;
			}
			if( typeof obj.pattern == 'undefined' || typeof obj.callback == 'undefined' ) {
				for( var pattern in obj ) {
					if( typeof pattern.match != 'undefined' && angular.isFunction(obj[pattern]) ) {
						navigationService.register({pattern:new RegExp(pattern),callback:obj[pattern]});
					}
				}
				return;
			}

			if( angular.isFunction(obj.callback) ) {
				registrants.push(obj);
			}
		},
		/**
         * Set a route
         *
         * @method set
         * @for routing
         * @namespace sl.navigation
         * @param {String} url
         */
		set:function(url) {
			function attempt() {
				$location.url(url);
			}
			$timeout(attempt);
		},
		/**
         * Get a route
         *
         * @method get
         * @for routing
         * @namespace sl.navigation
         */
		get:function() {
			return $location.url();
		}
	};
	return navigationService;
}]);
// Initialize the routing service
angular.module('sl.navigation').run(['routing',function(routing) {}]);


/**
 * Used for managing the breadcrumb trail.
 *
 * @class breadcrumbs
 * @uses routing
 */
angular.module('sl.navigation').service('breadcrumbs', ['routing', function(routing) {
    var breadcrumbs = [];
    var listeners = [];

    // Listen for url changes
	routing.register(function(url) {
		for( var i=breadcrumbs.length-1; i >= 0; i-- ) {
			var match = url.match(breadcrumbs[i].pattern);
			if( !match || match[0] != url ) {
				var evt = {cancel:false, url:url};
				try {
					if( angular.isFunction(breadcrumbs[i].removing) ) {
						breadcrumbs[i].removing.call(breadcrumbs[i], evt);
					}
				} catch(e) {
				}
				if( !evt.cancel ) {
					breadcrumbs.splice(i, 1);
				}
			}
		}
	});

	function notify() {
		for( var i=0; i < listeners.length; i++ ) {
			try {
				listeners[i].call({});
			} catch(e) {
				console && console.error && console.error('Breadcrumb listener failed:',e);
			}
		}
	}

	var _silent = false;
	var bc = {
		/**
         * Make a copy so it doesn't change behind our back
         *
         * @method get
         * @for breadcrumbs
         * @namespace sl.navigation
         */
		get : function() {
			return jQuery.merge([], breadcrumbs);
		},
		/**
         * Set the breadcrumb
         *
         * @method set
         * @for breadcrumbs
         * @namespace sl.navigation
         * @param {Object} newcrumbs
         */
		set : function(newcrumbs) {
			breadcrumbs = [];
			_silent = true;
			bc.push(newcrumbs);
			_silent = false;
			notify();
		},
		/**
         * Push to the crumb array
         *
         * @method push
         * @for breadcrumbs
         * @namespace sl.navigation
         * @param {Array} crumb
         */
		push : function(crumb) {
			if( angular.isArray(crumb) ) {
				for( var i=0; i < crumb.length; i++ ) {
					bc.push(crumb[i]);
				}
				return;
			}

			if( typeof crumb.match != 'undefined' ) {
				crumb = { label:crumb };
			}

			// Make a copy so it doesn't change behind our back
			crumb = jQuery.extend({}, crumb);

			if( typeof crumb.pattern == 'undefined' ) {
				crumb.pattern = /.*/;
			}
			if( typeof crumb.label == 'undefined' ) {
				if( typeof crumb.link != 'undefined' ) {
					crumb.label = crumb.link;
				} else {
					return;
				}
			}
			breadcrumbs.push(crumb);
			if( !_silent ) {
				notify();
			}
		},
		/**
         * Remove the last element of the breadcrumbs array
         * and return the element
         *
         * @method pop
         * @for breadcrumbs
         * @namespace sl.navigation
         */
		pop : function() {
			if( breadcrumbs.length > 0 ) {
				var last = breadcrumbs.pop();
				notify();
				return last;
			}
			return null;
		},
		/**
         * Listen for changes to the breadcrumbs
         *
         * @method listen
         * @for breadcrumbs
         * @namespace sl.navigation
         * @param {Object} listener
         */
		listen : function(listener) {
			listeners.push(listener);
		}

	}; 
	return bc;
}]);
// Initialize the breadcrumb service
angular.module('sl.navigation').run(['breadcrumbs',function(breadcrumbs) {}]);


/**
 * Used for managing the sidebar navigation.
 *
 * Options for registering a page/listener:
 *
 *      {
 *          label : 'Dashboard',
 *          group : null,
 *          url : '/dashboard',
 *          callback : function() {},
 *          patterns : [],
 *          order : 0,
 *          required : ['dashboard_view']
 *      }
 *
 * @class navigation
 * @uses routing
 */
angular.module('sl.navigation').service('navigation', ['routing', function(routing) {
	var items = [];
	var nav = {
		/**
         * Return an array of navigation items
         *
         * @method register
         * @for navigation
         * @namespace sl.navigation
         * @param {Array} item
         */
		register:function(item) {
			if( angular.isArray(item) ) {
				for( var i=0; i < item.length; i++ ) {
					nav.register(item[i]);
				}
				return;
			}

			if( typeof item.match != 'undefined' ) {
				item = {label:item};
			}

			// Make a copy so it doesn't change behind our back
			item = jQuery.extend({}, item);

			if( typeof item.label == 'undefined' ) {
				if( typeof item.url == 'undefined' ) {
					return;
				}
				item.label = item.url;
			}
			items.push(item);
		}
	};
	return nav;
}]);
// Initialize the navigation service
angular.module('sl.navigation').run(['navigation',function(navigation) {}]);

/**
 * <h4>Options:</h4>
 * <dl>
 *     <dt>title</dt>
 *     <dd>Page/Block/Navigation/Breadcrumb Title</dd>
 *
 *     <dt>type</dt>
 *     <dd>block, page, container<br>
 *         If container, the page will be considered a holder for other registered blocks.
 *         If page, the content will be rendered in the full content area when the url matches.
 *         If block, the content will be shown as a block in the content area when the url matches.
 *     </dd>
 *
 *     <dt>order</dt>
 *     <dd>Used to order the blocks in a container  lower numbers come first</dd>
 *
 *     <dt>navigation</dt>
 *     <dd>true/false (default is true): show the block in the navigation bar</dd>
 *
 *     <dt>breadcrumb</dt>
 *     <dd>true/false (default is true): show the block in the breadcrumb trail</dd>
 *
 *     <dt>content</dt>
 *     <dd>Page content. Can be a callback function or a path to the html.</dd>
 *
 *     <dt>preContent</dt>
 *     <dd>Notification function before the content is pulled.</dd>
 *
 *     <dt>postContent</dt>
 *     <dd>Notification function after the content is pulled.</dd>
 *
 *     <dt>require</dt>
 *     <dd>Require the specified permissions for showing the content.</dd>
 *
 *     <dt>includeUrl</dt>
 *
 *     <dt>excludeUrl</dt>
 *
 *     <dt>zone</dt>
 * </dl>
 *
 * @submodule blocks
 *
 */
/*
angular.module('sl.navigation').service('blocks', ['routing', '$rootScope', function(routing, $rootScope) {

	var defaults = {
		title : '<Page Title Here>',
		type  : 'page',
		order : 1000,
		navigation : true,
		breadcrumb : true,
		content : function() {},
		preContent : function() {},
		postContent : function() {},
		require : []
	};

	var currentUrl = '/';
	var currentParams = {};
	var currentHierarchy = ['/'];
	routing.register(function(url, params) {
		currentUrl = url;
		currentParams = params;
		var split = url.split('/');
		var parent = '/';
		var hierarchy = ['/'];
		while( split.length > 0 ) {
			var piece = split.shift();
			if( jQuery.trim(piece.length) > 0 ) {
				parent += piece+'/';
				hierarchy.push(parent);
			}
		}
		currentHierarchy = hierarchy;
		redoBlocks();
	});

	function redoBlocks() {
		console && console.log && console.log('blocks:',currentUrl, currentParams, currentHierarchy);
		var urlBlocks = getBlocks(currentUrl);
		var contentBlock = null;

		// Try to find a page block that matches
		for( var i=0; i < urlBlocks.length; i++ ) {
			if( urlBlocks[i].type == 'page' ) {
				contentBlock = urlBlocks[i];
			}
		}

		// Now look for a container block that matches
		if( contentBlock == null ) {
			for( var i=0; i < urlBlocks.length; i++ ) {
				if( urlBlocks[i].type == 'container' ) {
					contentBlock = urlBlocks[i];
				}
			}
		}

		if( contentBlock == null ) {
			contentBlock = jQuery.extend({}, defaults, {type:'container'});
		}

		console && console.log && console.log('content block:', contentBlock);

		// Call preContent
		try {
			contentBlock.preContent.call(contentBlock, currentUrl, currentParams);
		} catch(e) {
			console && console.error && console.error('preContent failed:', contentBlock, e.message);
		}

		$rootScope.contentModule = contentBlock.title;

		var content = '';
		if( contentBlock.type == 'page' ) {
			if( jQuery.isFunction(contentBlock.content) ) {
				try {
					content = contentBlock.content();
				} catch(e) {
					console && console.error && console.error('content failed:', contentBlock, e.message);
				}
			} else {
				// TODO grab content from the partial
			}
		}

		// It's a container, so grab the content of all the blocks registered for the url
		else {
			var blocks = [];
			// TODO grab the blocks
			// TODO generate blocks and append to content
		}
		
		// TODO process content using angular and show in content area

		// TODO generate bread crumb trail based on url hierarchy
		var breadCrumbs = [];

		// TODO generate navigation based on url hierarchy

		try {
			contentBlock.postContent.call(contentBlock, currentUrl, currentParams);
		} catch(e) {
			console && console.error && console.error('postContent failed:', contentBlock, e.message);
		}
	}

	var blocks = {};
	function getBlocks(url) {
		if( typeof blocks[url] == 'undefined' ) {
			blocks[url] = [];
		}
		return blocks[url];
	}
	var blockService = {
		register : function(url, options) {

			if( url == null || typeof url == 'undefined' || typeof url.match == 'undefined' ) {
				return;
			}
			if( url[url.length]-1 != '/' ) {
				url += '/';
			}

			if( options == null || typeof options == 'undefined' || !angular.isObject(options) ) {
				options = {};
			}

			options = jQuery.extend({}, defaults, options);
			var urlBlocks = getBlocks(url);
			urlBlocks[url].push(options);

		},
		get : function(url) {
			return jQuery.merge([], getBlocks(url));
		}
	};

	return blockService;
}]);
angular.module('sl.navigation').run(['blocks', function(blocks) {}]);
*/
