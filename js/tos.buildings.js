var ToSSmallShop = function(){
	this.type = 'SmallShops';
	this.since = new Date();
	this.capacity = 200;
	this.maxSellers = 2;
	this.maxManagers = 1;
	this.cost = 50;
	this.price = 500;
	this._Sellers = [];
	this._Managers = [];
};

ToSSmallShop.prototype = {
	constructor: ToSSmallShop,
	
	process: function() {
		this._sold = 0;
		// sellers
		for (var w in this._Sellers){
			this._Sellers[w].process();
			this._sold += this._Sellers[w]._sold;
		}
		// managers
		// comming soon
	},

	addWorker: function(w){
		if(this['_' + w.type].length < this['max' + w.type]){
			this['_' + w.type].push(w);
			// link to this shop
			w.shop = this;
			return true;
		} else {
			return false;
		}
	},

	getCosts: function(){
		var r = this.cost;
		for (var w in this._Sellers){
			r += this._Sellers[w].cost;
		}
		return r;
	}
};