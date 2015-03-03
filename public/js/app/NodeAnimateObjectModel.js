if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	
	var env = require('./Env')
	
	if(env == 'node'){
		return function(){}
	}else{
		return require('./AnimateObjectModel')
	}
  });