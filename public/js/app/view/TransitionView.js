
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.epoxy')
	var template = require('text!/template/transition.html')
	var Transition = require('./../Transition');
	var PropertyTransition = require('./../PropertyTransition');
	var TransitionItemView = require('./TransitionItemView')
	var WaveSurfer = require('wavesurfer');
	require('drawer');
	require('wavesurfer.transition.region');
	
	var TransitionView = Backbone.Epoxy.View.extend({
		el : "#editForm",
		events: {
            "click .fromShowOnCanvas": "fromShowOnCanvas",
			"click .addTransition" : "addTransition"
        },
		bindings: {
			"input.objectName": "value:name,events:['keyup']",
			"select.frameOptions" : "options:frameDropDown"
		},
		addTransition : function(){
			var cid = this.$el.find('.frameOptions').val();
			var modelByCid = this.model.get("transitionList").get(cid);
			var modelIndex = this.model.get("transitionList").indexOf(modelByCid);
			console.log('modelIndex = ' + modelIndex)
			var newTransition = new Transition({from : 1000 , to : 2000})
			console.log('befor adding transition is' ,newTransition )
			this.fabricObject.addTransition(newTransition, modelIndex);
			console.log('after adding transition is' ,newTransition )
					
			//this.model.get("transitionList").add(new Transition({from : 1000 , to : 2000}) , {at : modelIndex + 1})
			//console.log('now transitionlist is ' , this.model.get("transitionList"))
			/*
			var index = this.collection.indexOf(this.model);
			var modelAbove = this.collection.at(index-1);*/
		},
		initialize : function(params){
			this.model = params.model
			this.fabricObject = params.fabricObject
			this.template = _.template(template);
			this.region = params.region;
			var frameDropDown = []
			
			this.model.get("transitionList").each(function(transition){
				//console.log(transition)
				//console.log(transition.get('cid'))
				frameDropDown.push({label : 'Frame - ' + transition.get('from') + '-' + transition.get('to'), value : transition['cid']})
			})
			this.model.set('frameDropDown' , frameDropDown)
			//console.log(this.template())
			this.$el.html(this.template({model : {}}));
			 /*
			this.$el.find('#aObjectTransition').slider({
				min: 0,
				max: 100,
				values: [25, 50, 75],
				slide: function (evt, ui) {
					console.log(evt, ui)
				}
			});
			console.log(jQuery._data( this.$el.find('#aObjectTransition').get(0), "events" ))
			console.log(jQuery._data( this.$el.find('#aObjectTransition').find('.ui-slider-handle')[0], "events"))
			//this.$el.find('#aObjectTransition').not('.ui-slider-handle').unbind('mousedown')
			//this.$el.find('.ui-slider-handle').unbind('mousedown')*/
			/*
			this.transitionRegions = Object.create(WaveSurfer.TransitionRegions);
			this.transitionRegions.init(this.$el.find('#aObjectTransition').get(0),[],{
				height : 15,
				backgroundColor : 'pink'
			});*/
			//this.applyBindings();
			var appendTo = this.$el
			//appendTo.find("#accordion2").append(new TransitionItemView({model:this.model.get("transitionList").at(0)}).render().el);
			console.log('start appending')
			this.model.get("transitionList").each(function(transition){
				//console.log(appendTo.find("#accordion2"))
				//console.log(new TransitionItemView({model:transition}).render().el)
				
				appendTo.find("#accordion2").append(new TransitionItemView({model:transition, fabricObject : params.fabricObject}).el);
			})
			console.log('end appending')
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