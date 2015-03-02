if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var template = require('text!/template/aminateObject.html')
	require('backbone')
	require('backbone.epoxy')
	var KeyframeView = require('app/view/keyframeView')
		var TransitionView = require('app/view/TransitionView');
	
	AnimateObjectView = Backbone.View.extend({
		el : "#editForm",
		initialize : function(params){
			this.model = params.model;
			this.fabricObject = params.fabricObject;
			var transitionView = new TransitionView( {model : this.model, fabricObject : this.fabricObject})
			transitionView.render()
			this.$el.append(transitionView.$el)
		},
    });

	return AnimateObjectView
})