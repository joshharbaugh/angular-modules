angular.module('sl.store').service('store', [function() {
	var stores = {};
	
	function getStore(store) {
		if( typeof stores[store] == 'undefined' ) {
			stores[store] = {};
		}
		return stores[store];
	}

	function getTable(store, table) {
		var db = getStore(store);
		if( typeof db[table] == 'undefined' ) {
			db[table] = TAFFY();
		}
		return db[table];
	}
	
	var service = {
		insert:function(store, table, obj) {
			var db = getTable(store, table);
			db.insert(obj);
		},
		get:function(store, table) {
			var db = getTable(store, table);
			return db().order('priority').get();
		},
		remove:function(store, table, obj) {
			var db = getTable(store, table);
			db(obj).remove();
		},
		getService:function(store) {
			return {
				register:function(table, obj) {
					service.insert(store, table, obj);
				},
				getRegistered:function(table) {
					return service.get(store, table);
				}
			}
		}
	};
	return service;
}]);
