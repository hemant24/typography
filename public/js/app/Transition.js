if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.associations')
	var PropertyTransition = require('./PropertyTransition')
	var Id = require('./Id')
	var Transition = Backbone.AssociatedModel.extend({
		relations:[
			{
				type:Backbone.Many,
				key:'propertyTransitions',
				relatedModel:PropertyTransition
			}],
		 defaults : {
			from : '',
			to : '',
			linkedFrom : true,
			linkedTo : true,
			transitionId : null,
			propertyTransitions : []
		},
		initialize: function(){
			if(this.get('transitionId') == null){
				this.set('transitionId', Id.getNew());
			}
			this.on('change', function(){
				//console.log('okay  change transition object itself')
			})
		},
		addPropertyTransition : function(propertyTransition){
			this.get("propertyTransitions").add(propertyTransition)
			return this;
		},
		addProperty : function(name){
			var propertyTransition = new PropertyTransition({name : name});
			return propertyTransition
		}
	
	});
	return Transition
})