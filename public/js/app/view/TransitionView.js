
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
	var fabric = require('fabric')
	require('drawer');
	require('wavesurfer.transition.region');
	
	var TransitionView = Backbone.Epoxy.View.extend({
		el : "#editForm",
		events: {
            "click .fromShowOnCanvas": "fromShowOnCanvas",
			"click .addTransition" : "addTransition",
			"click .removeObject" : "removeObject",
			"click .updateUsingCurrentObj" : "updateTransitionObj",
			"click .updateUsingCurrentCam" : "updateTransitionCam"
        },
		bindings: {
			"input.objectName": "value:name,events:['keyup']",
			"input.fontSize": "value:fontSize,events:['keyup']",
			"input.color": "value:color,events:['keyup']",
			"input.fontFamily": "value:fontFamily,events:['keyup']",
			"select.frameOptions" : "options:frameDropDown"
		},
		updateTransitionObj : function(){
			this.updateTransitionRefObj.call(this, this.fabricObject)
		}, 
		updateTransitionCam : function(){
			this.updateTransitionRefObj.call(this, this.animator.getCamera())
		},
		updateTransitionRefObj : function(refObj){
			var currentTime = this.audioTrack.wavesurfer.getCurrentTime()*1000
			var currentTransition = this.fabricObject.getKeyframeByTime(currentTime)
			var leftPropertyTransition = null;
			
			var topPropretyTransition = null;
			
			for(var pt in currentTransition['propertyTransitions']){
				var propTransition = currentTransition['propertyTransitions'][pt]
				if(propTransition['name'] == 'left'){
					leftPropertyTransition = propTransition
				}
				
				if(propTransition['name'] == 'top'){
					topPropretyTransition = propTransition
				}
			}
			var easeFn = function(t, b, c, d) {return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;}
			
			if(topPropretyTransition.easeFn != null && $.trim(topPropretyTransition.easeFn).length != 0){
				easeFn = eval('fabric.util.ease.' + topPropretyTransition.easeFn)
			}
					
			console.log('topPropretyTransition', topPropretyTransition)
			console.log('leftPropertyTransition', leftPropertyTransition)
			console.log( 'seekAt' , (currentTime - currentTransition['from'] ), 
				'from ' , parseFloat(topPropretyTransition['from']), 
				'byValue ' , parseFloat(topPropretyTransition['to']) - parseFloat(topPropretyTransition['from']),
				'duration ' , currentTransition['from'] - currentTransition['to'])
			var predictedTopValue = easeFn(currentTime - currentTransition['from'], parseFloat(topPropretyTransition['from']),  parseFloat(topPropretyTransition['to']) -parseFloat(topPropretyTransition['from']) ,  currentTransition['from'] - currentTransition['to']);
			
			var predictedLeftValue = easeFn(currentTime - currentTransition['from'], parseFloat(leftPropertyTransition['from']),  parseFloat(leftPropertyTransition['to']) -parseFloat(leftPropertyTransition['from']) ,  currentTransition['from'] - currentTransition['to']);
			
			console.log('predited top' , predictedTopValue);
			console.log('predited left' , predictedLeftValue);
			
			var refX = refObj.get('left');
			var refY = refObj.get('top');
			var objectInitialState = this.fabricObject.get('startState');
			console.log('dx ', objectInitialState);
			var originX = objectInitialState['left']
			var originY = objectInitialState['top']
			var dx = refX - predictedLeftValue// originX
			var dy = refY - predictedTopValue//originY
			console.log('dx ', dx);
			console.log('dy', dy);
			console.log("this.fabricObject" , this.fabricObject);
			console.log("this.fabricObject.get('transitionList')" , this.fabricObject.get('transitionList'))
			for( var t in this.fabricObject.get('transitionList')){
				var transition = this.fabricObject.get('transitionList')[t]
				transition.get('propertyTransitions').each(function(propTransition){
					if(propTransition.get('name') == 'left'){
						var fromDx = refX - propTransition.get('from')
						var toDx = refX - propTransition.get('to')
						console.log('fromDx', fromDx, 'toDx', toDx);
						propTransition.set('from', propTransition.get('from') + dx)
						propTransition.set('to', propTransition.get('to') + dx)
					}
					
					if(propTransition.get('name') == 'top'){
						var fromDy = refY - propTransition.get('from')
						var toDy = refY - propTransition.get('to')
						console.log('fromDy', fromDy, 'toDy', toDy);
						propTransition.set('from', propTransition.get('from') + dy)
						propTransition.set('to', propTransition.get('to') + dy)
					}
				})
				
			}
		
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
			this.audioTrack = params.audioTrack;
			this.region = params.region;
			var frameDropDown = []
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
			this.model.get("transitionList").each(function(transition, index){
				
				if(transition.get('from') >= regionStartTime && transition.get('to') <= regionEndTime){
					appendTo.find("#accordion2").append(new TransitionItemView({model:transition, animator : params.animator,  fabricObject : params.fabricObject, index : index}).el);
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