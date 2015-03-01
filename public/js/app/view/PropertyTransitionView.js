
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.epoxy')
	var template = require('text!/template/propertyTranstion.html')
	var PropertyTransitionView = Backbone.Epoxy.View.extend({
		 initialize: function() {
				this.template = _.template(template);
				this.applyBindings();
			},
		  bindings: "data-bind",
		  render : function(){
			this.$el.html(this.template());
			this.applyBindings();
			return this
		  }
	})
	return PropertyTransitionView;

})