
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.epoxy')
	var template = require('text!/template/propertyTranstion.html')
	var fabric = require('fabric')
	var PropertyTransitionView = Backbone.Epoxy.View.extend({
		events : {
			"change .allEaseOptions": "changeEase",
		},
		changeEase : function(){
			//console.log($(this).val())
			console.log('ease changed');
		},
		 initialize: function() {
				this.template = _.template(template);
				var allEase = [{label : 'None', value : null}]
				for(var key in fabric.util.ease){
					allEase.push({label : key, value : key});
				}
				
				this.model.set('allEaseDropDown', allEase)
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