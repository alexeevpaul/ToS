var Graph = {

	conf: {
		height: 160,
		width: 512,
		columns: 32,
		cell: 16 // 1024 / 64
	},

	init: function(w) {
		this._wrap = typeof w == 'string' ? document.getElementById(w) : w;
		this._paper = new myR(this._wrap, this.conf.width, this.conf.height);
		this._grid = this._paper.path('M0,0L0,0', {
			stroke: '#004400',
			'stroke-width': 1,
			fill: 'none'
		});
		for(var pv = '', i = 0; i < this.conf.columns; i++){
			pv += 'M' + i * this.conf.cell + ',0L' +  + i * this.conf.cell + ',' + this.conf.height;
		}
		for(var ph = '', i = 0; i < 10; i++){
			ph += 'M0,' + i * this.conf.height / 10 + 'L' +  + this.conf.width + ',' + i * this.conf.height / 10;
		}
		this._grid.attr({
			d: pv + ph
		});
		this._sfill = this._paper.path('M0,0L0,0', {
			stroke: 'none',
			'fill-opacity': 0.2,
			fill: 'yellow'
		});
		this._sline = this._paper.path('M0,0L0,0', {
			stroke: 'yellow',
			'stroke-width': 1,
			fill: 'none'
		});

		this._fill = this._paper.path('M0,0L0,0', {
			stroke: 'none',
			'fill-opacity': 0.3,
			fill: 'black'
		});
		this._line = this._paper.path('M0,0L0,0', {
			stroke: 'green',
			'stroke-width': 2,
			fill: 'none'
		});

		this._dline = this._paper.path('M0,0L0,0', {
			stroke: 'red',
			'stroke-width': 1,
			fill: 'none'
		});
		
		this._data = [];

	},

	pushData: function(data) {
		this._data.push(data);
		if(this._data.length > this.conf.columns + 1) {
			this._data.splice(0, 1);
		}
		this.draw();
	},

	calculatePosition: function(i, p) {
		return this.conf.height - this._data[i][p] * 32;
	},

	draw: function() {
		var path = 'M0,' + this.calculatePosition(0, 'valuei');
		for(var i = 1, l = this._data.length; i < l; i++) {
			path += 'L' + i * this.conf.cell + ',' + Math.round(this.calculatePosition(i, 'valuei'));
		}
		this._line.attr({
			d: path
		});
		this._fill.attr({
			d: path + 'L' + (i - 1) * this.conf.cell + ',160L0,160Z'
		});
		path = 'M0,' + this.calculatePosition(0, 'valueo');
		for(var i = 1, l = this._data.length; i < l; i++) {
			path += 'L' + i * this.conf.cell + ',' + Math.round(this.calculatePosition(i, 'valueo'));
		}
		this._sline.attr({
			d: path
		});
		this._sfill.attr({
			d: path + 'L' + (i - 1) * this.conf.cell + ',160L0,160Z'
		});
		path = 'M0,' + this.calculatePosition(0, 'valued');
		for(var i = 1, l = this._data.length; i < l; i++) {
			path += 'L' + i * this.conf.cell + ',' + Math.round(this.calculatePosition(i, 'valued'));
		}
		this._dline.attr({
			d: path
		});
	}
};
var myRUid = (function() {
	var id = 0;
	return function() {
		return id++;
	};

})();
var myR = function(el, width, height) {
		this._NS = 'http://www.w3.org/2000/svg';
		this._NSLink = 'http://www.w3.org/1999/xlink';
		var self = this;
		this.init = function(el, width, height) {
			this.dom = this._ce('svg', {
				'version': '1.1',
				'height': height,
				'width': width,
				'style': 'overflow-x: hidden; overflow-y: hidden;'
			}, true);
			this.p = this.dom.ownerDocument.createElementNS(this._NS, 'g');
			this.p.setAttribute('etype', 'TPaper');
			this.p.setAttribute('transform', 'translate(0, 0)scale(1)');
			//if(isWebKit || isiOS) {
			this.p.setAttribute('transform', 'translate(-0.5, -0.5)scale(1)');
			//}
			this.dom.appendChild(this.p);
			if(typeof el == 'string') {
				document.getElementById(el).appendChild(this.dom);
			} else if(el && el.appendChild) {
				el.appendChild(this.dom);
			} else {
				return false;
			}
			// set link to paper
			el._paper = this;
			this.clear = function() {
				while(this.p.firstChild) {
					this.p.removeChild(this.p.firstChild);
				}
				return this;
			};

			// add defs for patterns and gradients
			this._patterns = this._cd('defs', {
				'etype': 'TPatterns'
			});
			this._gradients = this._cd('defs', {
				'etype': 'TGradients'
			});
			this._filters = this._cd('defs', {
				'etype': 'TFilters'
			});
			return this;
		};


		this.setAspectRatio = function(value) {
			this.dom.setAttribute('preserveAspectRatio', value);
		};


		this.setSize = function(width, height) {
			this.dom.setAttribute('width', width);
			this.dom.setAttribute('height', height);
			return this;
		};


		this.setViewBox = function(left, top, width, height) {
			this.dom.setAttribute('viewBox', left + ' ' + top + ' ' + width + ' ' + height);
			return this;
		};


		this.getViewBox = function() {
			var v = this.dom.getAttribute('viewBox');
			v = v.split(' ');
			return {
				left: v[0],
				top: v[1],
				width: v[2],
				height: v[3]
			};
		};


		this.scale = function(scale) {
			this.p.setAttribute('transform', 'translate(0, 0)scale(' + scale + ')');
			if(isWebKit || isiOS) {
				this.p.setAttribute('transform', 'translate(-0.5, -0.5)scale(' + scale + ')');
			}
			return this;
		};


		this._ce = function(el, attr, ns) {
			var el = ns ? document.createElementNS(this._NS, el) : document.createElement(el);
			for(var p in attr) {
				el.setAttribute(p, attr[p]);
			}
			return el;
		};


		this._cd = function(el, attr, ns) {
			return new MyRtNode(el, attr, this, true);
		};


		this._cn = function(el, attr) {
			return new MyRtNode(el, attr, this);
		};


		this._uid = function() {
			return 'uid' + myRUid();
		};


		this.path = function(path, attr) {
			var attr = attr || {};
			attr.id = this._uid();
			if(typeof path == 'object' && path instanceof Array) {
				var str = 'M' + path[0].x + ',' + path[0].y;
				for(var i = 1, l = path.length; i < l; i++) {
					str += 'L' + path[i].x + ',' + path[i].y;
				}
			}
			attr.d = str || path || 'M0,0';
			attr.etype = 'path';
			var el = this._cn('path', attr);
			el.id = attr.id;
			return el;
		};

		return this.init(el, width, height);
	};

var MyRtNode = function(el, attr, paper, root) {
	this.node = paper.dom.ownerDocument.createElementNS(paper._NS, el);
	this.paper = paper;
	this.etype = attr ? attr.etype : null;

	// link to object
	this.node._object = this;
	if(root != undefined && root == true) {
		paper.dom.appendChild(this.node);
	} else {
		paper.p.appendChild(this.node);
	}
	if(attr) {
		for(var p in attr) {
			this.node.setAttribute(p, attr[p]);
		}
	}
	return this;
};

MyRtNode.prototype = {
	constructor: MyRtNode,

	attr: function(attr) {
		if(typeof attr == 'string') {
			return this.node.getAttribute(attr);
		}
		for(var p in attr) {
			if(this.etype == 'text' && p == 'text') {
				this.node.firstChild.nodeValue = attr[p];
			} else {
				this.node.setAttribute(p, attr[p]);
			}
		}
		return this;
	}
};