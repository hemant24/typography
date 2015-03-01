if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {


	var Sequence = function(start, end, delta){

		this.start = start || 0 ;
		this.end = end || 100  ;
		this.delta = delta || 1 ;
		this.current = this.start - this.delta;
	}
	
	Sequence.prototype.next = function(){
		this.current = this.current + this.delta;
		if(this.current > this.end){
			return null;
		}

		return this.current;
	}
	
	
	
	return Sequence
});