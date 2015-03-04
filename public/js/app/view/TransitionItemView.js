
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
			"click .fromGetFromCanvas": "fromGetFromCanvas",
			"click .toGetFromCanvas": "toGetFromCanvas",
			"click .toShowOnCanvas": "toShowOnCanvas"
        },
		bindings: {
			"input.startAt": "value:integer(from),events:['keyup']",
			"input.endAt": "value:integer(to),events:['keyup']",
			"span.frameFrom": "text:from",
			"span.frameTo": "text:to"
		 },
		
		fromShowOnCanvas : function(){
			this.showOnCanvas("from")
		},
		fromGetFromCanvas : function(){
			this.getFromCanvas("from")
			
		},
		toShowOnCanvas : function(){
			this.showOnCanvas("to");
		},
		toGetFromCanvas : function(){
			this.getFromCanvas("to");
		},
		showOnCanvas : function(toOrFrom){
			this.model.get("propertyTransitions").each(function(propertyTransition){
				this.fabricObject.set(propertyTransition.get('name'), propertyTransition.get(toOrFrom));
				this.fabricObject.selectable = true;
				//this.fabricObject.setCoords();
				this.fabricObject.bringForward();
				this.fabricObject.canvas.setActiveObject(this.fabricObject)
				this.fabricObject.canvas.renderAll();
			}.bind(this))
		},
		getFromCanvas : function(toOrFrom){
			this.model.get("propertyTransitions").each(function(propertyTransition){
				var currentValue = this.fabricObject.get(propertyTransition.get('name'))
				propertyTransition.set(toOrFrom, currentValue)
			}.bind(this))
		},
		initialize : function(params){
			this.model = params.model;
			//console.log(this.model)
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