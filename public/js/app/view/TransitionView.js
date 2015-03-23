
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
	var AnimationPalete = require('./../AnimationPalete');
	var fabric = require('fabric')
	require('drawer');
	require('wavesurfer.transition.region');
	
	var TransitionView = Backbone.Epoxy.View.extend({
		el : "#editForm",
		events: {
            "click .fromShowOnCanvas": "fromShowOnCanvas",
			"click .addTransition" : "addTransition",
			"click .changeTransition" : "changeTransition",
			"click .removeObject" : "removeObject"
        },
		bindings: {
			"input.objectName": "value:name,events:['keyup']",
			"select.frameOptions" : "options:frameDropDown",
			"select.allTransitionsOptions" : "options:allTransitionsDropDown"
		},
		changeTransition : function(){
			var selectedPalette = this.$el.find('.allTransitionsOptions').val();
			var region = this.model.get('region');
			this.fabricObject.set('transitionList', [])
			var refObj = this.animator.getCamera();
			if(this.fabricObject.get('camerTransitions')){
				var dummyCamera = new fabric.ACamera({
					  top: this.animator.getCamera().get('top'),
					  left : this.animator.getCamera().get('left')
					})
				dummyCamera.set('transitionList', [this.fabricObject.get('camerTransitions')]);
				refObj = dummyCamera;
			}
			AnimationPalete.addTransitionToObject(selectedPalette, this.fabricObject, region.start, region.end, refObj);
		},
		removeObject : function(){
			this.model.get('region').remove();
			var index = this.animator._objs.indexOf(this.fabricObject);
			var camera = this.animator.getCamera();
			var cameraTransition = camera.get('transitionList');
			var cameraTransitionIndex = cameraTransition.indexOf(this.fabricObject.get('camerTransitions'))
			var currentTransition = cameraTransition[cameraTransitionIndex]
			var cameraPreviousTransition = cameraTransition[cameraTransitionIndex -1]
			var cameraNextTransition = cameraTransition[cameraTransitionIndex + 1]
			if(currentTransition && cameraNextTransition){
				var copyFromTransition = cameraNextTransition
				var isFirstTransition = false
				if(cameraPreviousTransition){
					copyFromTransition = cameraPreviousTransition
				}else{
					isFirstTransition = true;
				}
				cameraNextTransition.get('propertyTransitions').each(function(propTransition){
					console.log(propTransition);
					copyFromTransition.get('propertyTransitions').each(function(propToGet){
						if(propToGet.get('name') == propTransition.get('name')){
							propTransition.set('from', propToGet.get('from'));
							propTransition.set('to', propToGet.get('to'));
							if(isFirstTransition && propToGet.get('name') == 'top'){
								propTransition.set('from', 200);
								propTransition.set('to', 200);
							}
							if(isFirstTransition && propToGet.get('name') == 'left'){
								propTransition.set('from',300);
								propTransition.set('to', 300);
							}
						}
					})
				})
			}
			console.log('object camera assocaition', this.fabricObject.get('camerTransitions'));
			console.log('cameraTransition ' , cameraTransition);
			console.log('cameraTransitionIndex ' , cameraTransitionIndex);
			//cameraTransition = []
			camera.get('transitionList').splice(cameraTransitionIndex, 1);
			console.log('now camera transition is ', camera.get('transitionList'));
			this.animator._objs.splice(index,1);
			$("#dialog").dialog("close");
		},
		addTransition : function(){
			var cid = this.$el.find('.frameOptions').val();
			var modelByCid = this.model.get("transitionList").get(cid);
			var modelIndex = this.model.get("transitionList").indexOf(modelByCid);
			console.log('modelIndex = ' + modelIndex)
			var newTransition = new Transition({from : 1000 , to : 2000})
			//this.model.get("transitionList").add(newTransition, {at : modelIndex + 1, silent : true})
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
			console.log(' params.animator._objs ' , params.animator._objs)
			console.log(' this.fabricObject ', params.fabricObject);
			this.animator = params.animator
			this.fabricObject = params.fabricObject
			this.template = _.template(template);
			
			this.region = params.region;
			var frameDropDown = []
			var allTransitions = []
			var region = this.model.get('region')
			var regionStartTime = region['start']
			var regionEndTime = region['end']
			console.log('called transition view initilize', this.model);
			this.model.get("transitionList").each(function(transition){
				console.log(transition)
				console.log(transition.get('cid'))
				frameDropDown.push({label : 'Frame - ' + transition.get('from') + '-' + transition.get('to'), value : transition['cid']})
			})
			this.model.set('frameDropDown' , frameDropDown)
			var allSupportedTransitions = AnimationPalete.getAllTransitions()
			for(var idx in allSupportedTransitions){
				allTransitions.push({label : idx, value : idx})
			}
			this.model.set('allTransitionsDropDown' , allTransitions)
			console.log(allTransitions);
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
				
				if(transition.get('from') >= regionStartTime && transition.get('to') <= regionEndTime){
					appendTo.find("#accordion2").append(new TransitionItemView({model:transition, fabricObject : params.fabricObject}).el);
				}
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