if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('jquery')
	var data = {}
	var ClipBoard = function(){
		
	}
	
	ClipBoard.putData = function(d){
		console.log('put data to privatre data' , d)
		data = d;
	}
	
	ClipBoard.getData = function(){
		return data;
	}
	
	$(document).one("keydown", keyDownTextField, false);
	$(document).one("keyup", keyUpTextField, false);
	var ctrl = null
	function keyUpTextField(e){
		var keyCode = e.keyCode;
		if(keyCode==17) {
			ctrl = null
		}
	}
	function keyDownTextField(e) {
		var keyCode = e.keyCode;
		//console.log('key code is ', keyCode)
		if(keyCode==17) {
			ctrl = 17
		}
		if(keyCode==67 && ctrl == 17) {
			console.log('generating')
			$(document).trigger('copy');
			console.log('generating end')
			
		}
		if(keyCode==86 && ctrl == 17) {
			$(document).trigger('paste');
			
		}
	}
	return ClipBoard;
});