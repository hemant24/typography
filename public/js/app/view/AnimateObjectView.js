if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var template = require('text!/template/aminateObject.html')
	require('backbone')
	require('backbone.epoxy')
	var KeyframeView = require('app/view/keyframeView')
	
	var AnimateObjectModel = require('app/model/AnimateObjectModel')
	
	
	AnimateObjectView = Backbone.Epoxy.View.extend({
		template: _.template(template),
		//el: $("#editForm"),
		events: {
            "click #updateObjectBtn": "updateObjectState"
        },
		
		updateObjectState : function(){
			console.log(this.animateObject)
			console.log('will update object status')
		},
        initialize: function(animateObject){
			this.animateObject = animateObject;
            //this.render();
        },
        render: function(){
			/*
			var keyframe = new AnimateObjectModel({name : 'jatt'})
			this.keyframe = keyframe
			
			var accordionAppendTo = this.$el.find("#accordion2")
			accordionAppendTo.append(new KeyframeView({model : keyframe}).render())
			*/
			
			this.parse()
            this.el.innerHTML = this.template(this.model);
			
			console.log('find test sub' , this.$el.find("#testsub"))
			var accordionAppendTo = this.$el.find("#accordion2")
			_.each(this.animateObject.get('keyframeList'), function(keyframe){
				accordionAppendTo.append(new KeyframeView(keyframe).render())
			})
			//accordionAppendTo.accordion("refresh");
			
			$("#editForm").html(this.el.innerHTML)			
			$("#accordion2").accordion({
				heightStyle: "content",
				collapsible : true
			});
			return this;
			
        },
		parse : function(){
			this.model = {
						name : this.animateObject.get('text'),
						keyframeList : this.animateObject.get('keyframeList')
							}
		}
    });

	return AnimateObjectView
})