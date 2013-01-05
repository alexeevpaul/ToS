var ToS = {

	// 136240303
	conf: {
		since: new Date(),
		speedPause: 0,
		speedPlay: 2000,
		speedFast: 400,
		speedTurbo: 200,
		startWorkTime: 6,
		endWorkTime: 22,
		logLength: 48
	},

	_speed: 0,
	_cPrice: 2,
	_buildings: [],
	_SmallShops: 0,
	_Shops: 0,
	_Warehouses: 0,
	_Sellers: 0,
	_Managers: 0,
	_Accountants: 0,
	_money: 600,
	_product: 200,
	_capacity: 0,
	_daySales: {
		sold: 0,
		money: 0
	},
	_log: [],
	_day: 1,
	_time: 0,
	_buyComplete: 0,

	init: function() {
		// gui
		this.initGUI();

		// add first building
		this.addBuilding('SmallShop');
		this.addWorker('Seller');

		// sample market data
		for (var i = 0; i < 32; i++){
			this.calculateMarket();
			this._time++;
			Graph.pushData({
				title: this._textTime,
				valuei: this._inPrice,
				valueo: this._outPrice,
				valued: this._demand
			});
		}
		// set time to 05:00
		this._time = 4;

		// update stats
		this.process();

		// set pause
		this.setState('Pause');
		
		this.log(_Lang['keys']);
		this.log(_Lang['start message 5'], 'yellow');
		this.log(_Lang['start message 4'] + this.wCurrency(this._money) + '.', 'yellow');
		this.log(_Lang['start message 3'], 'yellow');
		this.log(_Lang['start message 2'], 'yellow');
		this.log(_Lang['start message 1'], 'yellow');
	},

	process: function() {
		this._time++;
		if(this._time == 24) {
			this._time = 0;
			this._day++;
			// -5%
			this._product = Math.round(this._product * 0.95);
		}
		// clear buy stop
		if(this._buyStop > 0){
			this._buyStop++;
			if(this._buyStop > 4){
				this._buyStop = 0;
			}
		}
		this._buyComplete = 0;

		this.calculateMarket();

		// add data to graph
		Graph.pushData({
			title: this._textTime,
			valuei: this._inPrice,
			valueo: this._outPrice,
			valued: this._demand
		});

		this.refreshStats();

		if(this._day > 0)
			this.calculationSales();

		// process
		if(this._speed !== 0) this._processTimer = setTimeout(function() {
			ToS.process();
		}, this._speed);
	},

	initGUI: function() {
		// localization
		document.title = _Lang.title;
		if(_Lang.currencyRight) this.conf.currencyRight = _Lang.currencyRight;
		var w = document.querySelectorAll('tt');
		for(var p, i = 0, l = w.length; i < l; i++){
			p = w[i].innerHTML;
			if(_Lang[p])
				w[i].innerHTML = _Lang[p];
		}
		// graph
		Graph.init('graph');

		this.bindMouse();
		this.bindKeyboard();
	},

	bindMouse: function() {
		var btns = document.querySelectorAll('*[state]');
		for(var i = 0, l = btns.length; i < l; i++) {
			btns[i].onclick = function() {
				ToS.setState(this.getAttribute('state'));
			}
		}
		var btns = document.querySelectorAll('*[action]');
		for(var i = 0, l = btns.length; i < l; i++) {
			btns[i].onclick = function(event) {
				event.stopPropagation();
				ToS.eAction(this.getAttribute('action'));
				return false;
			}
		}
	},

	bindKeyboard: function() {
		this._keyDownList = [];
		window.onkeydown = function(e) {
			//console.log('key press', e.keyCode);
			ToS._keyDownList[e.keyCode] = true;
			switch(e.keyCode) {
			case 27:
			case 49:
			case 80:
				// Esc, 1, p
				ToS.setState('Pause');
				break;
			case 13:
				// enter
				if(document.getElementById('buyControls').style.display != 'none') ToS.eAction('buy');
				break;
			case 37:
				// left
				break;
			case 39:
				// right
				break;
			case 38:
				// up
				ToS.eAction('buyInc');
				break;
			case 40:
				// down
				ToS.eAction('buyDec');
				break;
			case 32:
				// space
				ToS.setState('stop');
				break;
			case 50:
				// 2
				ToS.setState('Play');
				break;
			case 51:
				// 3
				ToS.setState('Fast');
				break;
			case 52:
				// 4
				ToS.setState('Turbo');
				break;
			}
		};
		window.onkeyup = function(e) {
			ToS._keyDownList[e.keyCode] = false;
		};
	},

	eAction: function(a) {
		switch(a) {
		case 'stop':
			//
			this.setState('stop');
			break;
		case 'buyDec':
			var v = parseInt(document.getElementById('buyValue').innerHTML, 10);
			if(v > 100) {
				v -= 100;
			}
			document.getElementById('buyValue').innerHTML = v;
			break;
		case 'buyInc':
			var v = parseInt(document.getElementById('buyValue').innerHTML, 10);
			v += 100;
			document.getElementById('buyValue').innerHTML = v;
			break;
		case 'buy':
			this.buyProduct(parseInt(document.getElementById('buyValue').innerHTML, 10));
			break;
		case 'addSeller':
			this.addWorker('Seller');
			break;

		case 'addSmallShop':
			this.addBuilding('SmallShop');
			break;
		}
	},

	updateSpeedButtons: function(){
		this._speed = this.conf['speed' + this._state];
		document.getElementById('btnPause').className = 'btn';
		document.getElementById('btnPlay').className = 'btn';
		document.getElementById('btnFast').className = 'btn';
		document.getElementById('btnTurbo').className = 'btn';
		document.getElementById('btn' + this._state).className = 'btnActive';
	},

	setState: function(state) {
		if(this._state == state) return this;
		// stop process
		if(this._processTimer !== undefined) {
			clearTimeout(this._processTimer);
		}
		// set state
		this._state = state;
		switch(state) {
		case 'stop':
			this._buyStop = 1;
			document.getElementById('buyControls').style.display = 'none';
			this.process();
			break;
		case 'Pause':
			this.updateSpeedButtons();
			break;
		case 'Play':
			this.updateSpeedButtons();
			this.process();
			break;
		case 'Fast':
			this.updateSpeedButtons();
			this.process();
			break;
		case 'Turbo':
			this.updateSpeedButtons();
			this.process();
			break;
		}
	},

	calculateMarket: function(){
		this._textTime = this._time < 10 ? '0' + this._time + ':00' : this._time + ':00';
		this._inPrice = this.getPrice(this._time);
		this._outPrice = this._inPrice + 0.1 + Math.random() * 0.8 - Math.random() * 0.2;
		this._demand = 0.5 + (this._outPrice - this._inPrice) * (this._outPrice - this._inPrice) * Math.random() * 10;
	},

	getPrice: function(t) {
		t -= 7;
		var r = 0.5;
		r += Math.sin(Math.PI / 16 * t);
		r = r + Math.random() * 0.5 - Math.random() * 0.5;
		if(t < 6) {
			r = r + Math.random() * 0.5 - Math.random() * 0.5 + 0.2;
		}
		if(t > 8) {
			r -= Math.random() * 0.3;
		}
		r *= 4;
		if(r < 2) {
			r += 2 + Math.random() * 2;
		}
		if(r < 0) {
			r += 2 + Math.random() * 1;
		}
		if(r < 2) {
			r += 2 + Math.random() * 2;
		}

		return Math.round(r * 5) / 10;
	},

	wWeight: function(s, wo){
		s = Math.round(s);
		return (s * _Lang.weightRate).toFixed(1) + (wo ? '' : ' ' + _Lang.weight);
	},

	wCurrency: function(s, round){
		s = round ? Math.round(s) : s.toFixed(1);
		return _Lang.currencyRight ? (s * (_Lang.currencyRate || 1)).toFixed(1) + ' ' + _Lang.currency : (_Lang.currency + s * (_Lang.currencyRate || 1)).toFixed(1);
	},

	refreshStats: function(noData) {
		document.getElementById('SmallShops').innerHTML = this._SmallShops;
		document.getElementById('Shops').innerHTML = this._Shops;
		document.getElementById('Warehouses').innerHTML = this._Warehouses;
		document.getElementById('Sellers').innerHTML = this._Sellers + ' <span class="light">(max ' + this._SmallShops * 2 + ')</span>';
		document.getElementById('Managers').innerHTML = this._Managers;
		document.getElementById('Accountants').innerHTML = this._Accountants;
		document.getElementById('day').innerHTML = this._day;
		document.getElementById('dayName').innerHTML = _Lang.days[(this._day - 1) % 7];
		document.getElementById('time').innerHTML = this._textTime || '00:00';
		document.getElementById('cprice').innerHTML = this.wCurrency(this._cPrice || 0) + ' / ' + _Lang.weight;
		document.getElementById('inprice').innerHTML = this.wCurrency(this._inPrice || 0);
		document.getElementById('outprice').innerHTML = this.wCurrency(this._outPrice || 0);
		document.getElementById('money').innerHTML = this.wCurrency(this._money);
		document.getElementById('product').innerHTML = this.wWeight(this._product);
		document.getElementById('capacity').innerHTML = this.wWeight(this._capacity);
		if(this._buyComplete > 0 || this.conf.startWorkTime > this._time || this.conf.endWorkTime < this._time || this._buyStop > 0) {
			document.getElementById('buyControls').style.display = 'none';
		} else {
			document.getElementById('buyControls').style.display = 'block';
		}
	},

	buyProduct: function(count) {
		// hide buttons and set state on next hour
		this._buyComplete = 1;
		document.getElementById('buyControls').style.display = 'none';

		// check money
		if(count * this._inPrice > this._money) {
			count = Math.floor(this._money / this._inPrice);
			if(count == 0) {
				this.log(_Lang['Not enough money'], 'red');
				return this;
			}
		}
		// check capacity
		if(this._product + count > this._capacity) {
			count = this._capacity - this._product;
			this.log(_Lang['Need more space on warehouse'], 'red');
		}
		count = Math.floor(count);
		if(count == 0) {
			return this;
		}

		// calc cPrice
		this._cPrice = (this._product * this._cPrice + count * this._inPrice) / (this._product + count);

		this._product += count;
		this._money -= count * this._inPrice;
		this.log(_Lang.Purchased + ': ' + this.wWeight(count) + ' x ' + this.wCurrency(this._inPrice) + ' = ' + this.wCurrency(count * this._inPrice));
		this.refreshStats();
	},

	addWorker: function(p){
		if(typeof window['ToS' + p] == 'function') {
			var w = new window['ToS' + p]();
		} else {
			return false;
		}
		// find available position
		for(var s in this._buildings) {
			if(this._buildings[s].addWorker(w)){
				this['_' + w.type]++;
				this.refreshStats();
				this.log(_Lang['Add ' + w.type], 'yellow');
				return true;
			}
		}
		this.log(_Lang['No positions available'], 'red');
		return false;
	},

	addBuilding: function(p) {
		if(typeof window['ToS' + p] == 'function') {
			var b = new window['ToS' + p]();
			if(this._money < b.price){
				this.log(_Lang['Not enough money'] + ': ' + this.wCurrency(b.price), 'red');
				return this;
			}
			this._buildings.push(b);
			this._money -= b.price || 0;
			this['_' + b.type]++;
			for(var w in b._workers){
				this['_' + b._workers[w].type]++;
			}
			this.log(_Lang['Add ' + b.type], 'yellow');
		}
		// recalculate capacity
		this._capacity = 0;
		for(var s in this._buildings) {
			this._capacity += this._buildings[s].capacity || 0;
		}
		this.refreshStats();
	},

	log: function(str, color) {
		c = color || '';
		if(this._log.length == this.conf.logLength) {
			this._log.splice(this.conf.logLength - 1, 1);
		}
		this._log.splice(0, 0, '<p class="' + c + '">' + str + '</p>');
		// draw
		document.getElementById('logList').innerHTML = this._log.join('');
		//document.getElementById('logList').scrollTop = 65000;
	},

	calculationSales: function() {
		// check work time
		if(this.conf.startWorkTime > this._time || this.conf.endWorkTime < this._time || this._buyStop > 0) {
			// hide buy buttons
			document.getElementById('buyControls').style.display = 'none';
			return this;
		}
		if((this._day - 1) % 7 > 4){
			document.getElementById('buyControls').style.display = 'none';
		}
		// shops
		var salesVolume = 0,
			moneyVolume = 0;
		for(var s in this._buildings) {
			this._buildings[s].process();
			this._product -= this._buildings[s]._sold;
			this._money += this._buildings[s]._sold * this._outPrice;
			salesVolume += this._buildings[s]._sold;
			moneyVolume += this._buildings[s]._sold * this._outPrice;
		}
		this._daySales.sold += salesVolume;
		this._daySales.money += moneyVolume;
		if(salesVolume > 0) this.log(_Lang.Day + ' ' + this._day + ', ' + this._textTime + ', ' + _Lang.Sales + ': ' + this.wWeight(salesVolume) + ' x ' + this.wCurrency(this._outPrice) + ' = ' + this.wCurrency(moneyVolume));

		if(this._product < 10) {
			this.log(_Lang['Need more product'], 'red');
		}

		if(this._time == this.conf.endWorkTime) {
			// costs
			var costs = 0;
			for(var s in this._buildings) {
				costs += this._buildings[s].getCosts();
			}
			this._money -= costs;
			this.log('--------------' + '<br>' + _Lang.Day + ' ' + this._day + '<br>' + _Lang.Sales + ': ' + this.wWeight(this._daySales.sold) + ', ' + this.wCurrency(this._daySales.money) + '<br>' + _Lang.Costs + ': ' + this.wCurrency(costs) + '<br>' + _Lang.Profit + ': ' + this.wCurrency(this._daySales.money - costs) + '<br>--------------', 'yellow');
			// clear data
			this._daySales = {
				sold: 0,
				money: 0
			};
		}
	}
};