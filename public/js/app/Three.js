if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	console.log('called')
	var env = require('./Env')
	console.log(env)
	if(env == 'node'){
		//return require('three')
	}else{
		return require('three_new')
	}
  });