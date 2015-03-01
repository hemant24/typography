if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.associations')
	var Transition = require('./Transition')

var AnimateObjectModel = Backbone.AssociatedModel.extend({
	relations:[{
		type:Backbone.Many,
		key:'transitionList',
		relatedModel: Transition
	}],
	defaults : {
		name : '',
		transitionList : []
	},
	initialize: function(){
		this.on('change', function(){
			console.log('Animated Object get changed')
		})
	}
});
	
return AnimateObjectModel
})