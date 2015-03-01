if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Properties = require('./Properties')
	var Keyframe = function(startAt, endAt, from, to , easing){
		this.startAt = startAt || 0;
		this.endAt = endAt || 0;
		this.from = from || new Properties();
		this.to = to || new Properties();
		//this.properties = properties || {};
		this.easing = easing || null;
		this.easeFn = null; //will get exported 
		this.running = false;
	}
	
	return Keyframe ;
  });