
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.epoxy')
	var template = require('text!/template/propertyTranstion.html')
	var PropertyTransitionView = Backbone.Epoxy.View.extend({
		 initialize: function() {
				this.template = _.template(template);
				//console.log(this.model)
				//this.applyBindings();
			},
		  bindings: "data-bind",
		  computeds: {
			differ: {
				deps: ["from", "to"],
				get: function(from, to ) {
					if( (to - from) != 0){
						return "red"
					}else{
						return "none"
					}
				}
			}
		},	
		  render : function(){
			this.$el.html(this.template());
			this.applyBindings();
			return this
		  }
	})
	return PropertyTransitionView;

})