var ToSSeller = function(shop){
	this.type = 'Sellers';
	this.birthday = new Date();
	this.experience = 0;
	this.totalSold = 0;
	this.cost = 20;
};

ToSSeller.prototype = {
	constructor: ToSSeller,
	
	process: function() {
		this._sold = 0;
		
		this._sold = Math.ceil(this.shop.capacity / 100 * (ToS._demand / 2));
		// check count
		if(this._sold > ToS._product){
			this._sold = ToS._product;
		}
		this.totalSold += this._sold;
		
		return this;
	}
};