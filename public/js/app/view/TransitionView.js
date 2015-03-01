
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.epoxy')
	var template = require('text!/template/transition.html')
	
	var TransitionItemView = require('./TransitionItemView')
	
	var TransitionView = Backbone.View.extend({
		el : "#editForm",
		initialize : function(params){
			this.model = params.model
			this.fabricObject = params.fabricObject
			this.template = _.template(template);
			//console.log(this.template())
			this.$el.html(this.template({model : {}}));
			//this.applyBindings();
			var appendTo = this.$el
			//appendTo.find("#accordion2").append(new TransitionItemView({model:this.model.get("transitionList").at(0)}).render().el);
			
			this.model.get("transitionList").each(function(transition){
				//console.log(appendTo.find("#accordion2"))
				//console.log(new TransitionItemView({model:transition}).render().el)
				
				appendTo.find("#accordion2").append(new TransitionItemView({model:transition, fabricObject : params.fabricObject}).render().el);
			})
			
			$("#accordion2").accordion({
				heightStyle: "content",
				collapsible : true,
				header : 'h3.header'
			});
			//this.$el.find("#accordion2").append(new TransitionItemView({model:this.model.get("propertyTransitions").at(0)}).render().el);
			//this.applyBindings();
		},
		remove: function() {
			  this.$el.empty().off(); /* off to unbind the events */
			  this.stopListening();
			  return this;
		}
	})
	
	return TransitionView

})