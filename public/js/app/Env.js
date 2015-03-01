if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
	define(function(require){
		return 'node'
	})
}else{
	define(function(require) {
		return 'browser'
	})
}

