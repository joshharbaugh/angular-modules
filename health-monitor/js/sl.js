angular.module('sl', ['sl.filters', 'sl.services', 'sl.directives', 'ui']);

// Filters
angular.module('sl.filters', []);

// Services
angular.module('sl.services', []);

// Directives
angular.module('sl.directives', ['ui'])
	.directive('slTip', function() {
		return {
			link: function(scope, element, attrs, controller) {
				var options = scope.$eval(attrs.slTip);
				var defaults = {
					position:{
						corner:{
							target:'bottomLeft',
							tooltip:'topRight'
						}
					},
					style:{
						name:'dark'
					}
				};
				
				options = jQuery.extend(true, defaults, options);
				element.qtip(options);
			}
		};
	})
	.directive('slButton', [
			'ui.config', '$timeout', function(uiConfig, $timeout) {
		return {
			link: function(scope, element, attrs, controller) {
				var down = false;
				element.addClass('ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only');
				element.attr('role', 'button');
				element.wrapInner('<span class="ui-button-text" />');
				element.mouseover(function() {
					element.addClass('ui-state-hover');
					if( down )
						element.addClass('ui-state-active');
				});
				element.mouseleave(function() {
					element.removeClass('ui-state-hover');
					element.removeClass('ui-state-active');
				});
				element.mousedown(function() {
					element.addClass('ui-state-active');
					down = true;
				});
				element.mouseup(function() {
					element.removeClass('ui-state-active');
					scope.$eval(attrs.slButton);
					down = false;
				});
			}
		};
	}])
	.directive('slFixedHeader', [
			'ui.config', '$window', '$timeout', function(uiConfig, $window, $timeout) {
		var options;
		options = {};
		return {
			link: function(scope, element, attrs, controller) {
				if( !element.is('table') || element.children('thead').length == 0 || element.children('tbody').length == 0 ) {
					console && console.log && console.log('Trying to apply sl-fixed-header to an object that isn\'t a well-formed table: needs to be a table element with thead and tbody elements');
					return;
				}
			
				var jqwindow = jQuery($window);

				var options = scope.$eval(attrs.slFixedHeader);
				if( typeof options == 'undefined' ) {
					options = {css:{}};
				} else if( typeof options.css == 'undefined' ) {
					options.css = {};
				}
				var defaultCss = {};

				var _top = 0;
				var _left = 0;
				var _tableWidth = 0;
				var _widths = [];
				function getHeaders(fake) {
					return element.children('thead').children('tr'+(fake?'.fake':':not(.fake)')).children('th');
				}

				function getWidths(fake) {
					var widths = [];
					var idx = 0;
					getHeaders(fake).each(function() {
						var paddingLeft = parseInt($(this).css('padding-left'));
						var paddingRight = parseInt($(this).css('padding-right'));
						var inner = $(this).innerWidth();
						var outer = $(this).outerWidth();
						widths[idx++] = {
							outer:outer,
							inner:inner,
							left:paddingLeft,
							right:paddingRight
						};
					});
					return widths;
				}

				var lastChecked = null;
				function checkResize() {
					if( _widths.length == 0 )
						return false;

					var widths = getWidths(true);
					if( widths.length != _widths.length ) {
						return false;
					}

					if( lastChecked != null && lastChecked.length != widths.length ) {
						lastChecked = null;
					}

					for( var i=0; i < widths.length; i++ ) {
						if( Math.abs(widths[i].inner - _widths[i].inner) > 1 && 
								(lastChecked == null || lastChecked[i].inner != _widths[i].inner) ) {
							lastChecked = jQuery.merge([], _widths);
							console.log('column resize');
							fixHeader(true);
							return true;
						}
					}

					return false;
				}

				var resizeID = -1;

				var $fake = jQuery();
				var $original = jQuery();
				var inited = false;
				var fixed = false;
				var initID = -1;
				function init(force, callback) {

					if( !inited || force ) {
						inited = true;

						$original.css(defaultCss);
						clearTimeout(initID);
						initID = setTimeout(function() {
							console && console.log && console.log('initting');
							$fake.remove();
							$original = element.children('thead').children('tr').not('.fake');
							$fake = $original.clone(false);
							$fake.css('display','none');
							$fake.addClass('fake');
							$original.after($fake);

							var offset = element.offset();
							_top = offset.top;
							_left = offset.left;
							_tableWidth = element.width();
							_widths = getWidths();

							callback();
						});

					}

				}

				var fixID = -1;
				function fixHeader(force) {

					clearTimeout(fixID);
					fixID = setTimeout(function() {

						var runID = fixID;

						console && console.log && console.log('fixing: '+runID);

						if( jqwindow.scrollTop() >= _top ) {
							if( !fixed || force ) {
								fixed = true;

								if( resizeID < 0 ) {
									resizeID = setInterval(checkResize, 500);
								}

								init(true, function() {

									console && console.log && console.log('init done: '+runID);

									var css = jQuery.extend({
										display:'block',
										position:'fixed',
										top:0,
										left:_left,
										width:_tableWidth,
										zIndex:10000
									}, options.css);


									for( var key in css ) {
										var defaultVal = $original.css(key);
										if( defaultVal == null )
											defaultVal = '';
										defaultCss[key] = defaultVal;
									}
									$original.css(css);

									var $fixedHeaders = getHeaders();
									for( var i=0; i < _widths.length; i++ ) {
										var w = _widths[i];
										var $th = $fixedHeaders.eq(i);
										$th.css({
											width:w.inner - w.left - w.right + 1
										});
									}

									$fake.css('display','');

								});
							}
						} else {
							if( fixed ) {
								fixed = false;
								if( resizeID >= 0 ) {
									clearInterval(resizeID);
									resizeID = -1;
								}
								getHeaders(true).css('width','');
								$fake.css('display','none');
								$original.css(defaultCss);
							}
						}
					});
				}

				jqwindow.scroll(function() {
					console && console.log && console.log('scrolled');
					fixHeader();
				});
				var resizeID = -1;
				jqwindow.resize(function() {
					clearTimeout(resizeID);
					resizeID = setTimeout(function() {
						console && console.log && console.log('resized');
						fixHeader(true);
					}, 250);
				});

				var opts, updateModel, usersOnSelectHandler;
				opts = angular.extend({}, options, scope.$eval(attrs.uiFixedHeader));
			}
		};
	}]);

