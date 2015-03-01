
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.epoxy')
	var template = require('text!/template/transitionItem.html')
	
	var PropertyTransitionView = require('./PropertyTransitionView')
	
	var TransitionItemView = Backbone.Epoxy.View.extend({
		events: {
            "click .fromShowOnCanvas": "fromShowOnCanvas",
			"click .fromGetFromCanvas": "fromGetFromCanvas"
        },
		bindings: {
			"input.startAt": "value:from,events:['keyup']",
			"input.endAt": "value:to,events:['keyup']",
			"span.frameFrom": "text:from",
			"span.frameTo": "text:to"
		 },
		fromShowOnCanvas : function(){
			console.log('okay will display')
			console.log(this.model)
		},
		fromGetFromCanvas : function(){
			var propertyToFetch = []
			this.model.get("propertyTransitions").each(function(propertyTransition){
				var currentValue = this.fabricObject.get(propertyTransition.get('name'))
				propertyTransition.set("from", currentValue)
			}.bind(this))
			
		},
		initialize : function(params){
			this.model = params.model;
			this.fabricObject = params.fabricObject;
			this.template = _.template(template);
			//console.log(this.template())
			this.$el.html(this.template());
			this.applyBindings();
			//console.log(this.model.get("propertyTransitions"))
			//console.log(this.model.get("propertyTransitions").at(0))
			var appendTo = this.$el
			this.model.get("propertyTransitions").each(function(propertyTransition){
				appendTo.find(".propertyList").append(new PropertyTransitionView({model:propertyTransition}).render().el);
			})
			//this.$el.find("#accordion2").append(new TransitionItemView({model:this.model.get("propertyTransitions").at(0)}).render().el);
			//this.applyBindings();
		},
		remove: function() {
			  this.$el.empty().off(); /* off to unbind the events */
			  this.stopListening();
			  return this;
		}
	})
	
	return TransitionItemView

})