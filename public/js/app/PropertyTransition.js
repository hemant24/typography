if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.associations')
	

var PropertyTransition = Backbone.AssociatedModel.extend({
	defaults : {
		name : '',
		from : '',
		to : '',
		ease : null,
		easeFn : null
	},
	initialize: function(){
		console.log('call initialize');
		this.on('change', function(){
			console.log('okay  property ' + this.get('from') + ' changed')
		})
	}
});
	
return PropertyTransition
})