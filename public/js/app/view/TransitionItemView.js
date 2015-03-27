
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.epoxy')
	var template = require('text!/template/transitionItem.html')
	var Transition = require('./../Transition');
	var PropertyTransitionView = require('./PropertyTransitionView')
	var AnimationPalete = require('./../AnimationPalete');
	var PropertyTransition = require('./../PropertyTransition')
	var TransitionItemView = Backbone.Epoxy.View.extend({
		events: {
            "click .fromShowOnCanvas": "fromShowOnCanvas",
			"click .fromGetFromCanvas": "fromGetFromCanvas",
			"click .toGetFromCanvas": "toGetFromCanvas",
			"click .toShowOnCanvas": "toShowOnCanvas",
			"click .changeTransition" : "changeTransition",
        },
		bindings: {
			"select.allTransitionsOptions" : "options:allTransitionsDropDown",
			"input.startAt": "value:integer(from),events:['keyup']",
			"input.endAt": "value:integer(to),events:['keyup']",
			"span.frameFrom": "text:from",
			"span.frameTo": "text:to",
			"input.index" : "value:integer(index)"
		 },
		changeTransition : function(){
			var selectedPalette = this.$el.find('.allTransitionsOptions').val();
			var allSupportedTransitions = AnimationPalete.getAllTransitions()
			var toApplyTransition = allSupportedTransitions[selectedPalette]
			if(toApplyTransition){
				var refObj = this.animator.getCamera();
				if(this.fabricObject.get('camerTransitions')){
					var dummyCamera = new fabric.ACamera({
						  top: this.animator.getCamera().get('top'),
						  left : this.animator.getCamera().get('left')
						})
					dummyCamera.set('transitionList', [this.fabricObject.get('camerTransitions')]);
					refObj = dummyCamera;
				}
				
				var initialTransition = null
				console.log('current object ', this.fabricObject);
				var currentObjectLocation = new fabric.AText('dummy', {left : this.fabricObject.get('left'), top : this.fabricObject.get('top')})
				console.log('currentObjectLocation ', currentObjectLocation);
				toApplyTransition = toApplyTransition(this.fabricObject, currentObjectLocation);
				var currentTransition = this.fabricObject.get('transitionList')[this.model.get('index')]
				var previousTransition = this.fabricObject.get('transitionList')[parseInt(this.model.get('index')) - 1]
				if(previousTransition){
					initialTransition = previousTransition
				}else{
					initialTransition = new Transition()
					currentTransition.get("propertyTransitions").each(function(propertyTransition){
						var propertyName = propertyTransition.get('name');
						initialTransition.addPropertyTransition(new PropertyTransition({name : propertyName,  from : this.fabricObject.get(propertyName), to :  this.fabricObject.get(propertyName), ease : fabric.util.ease.easeInQuad}))
					}.bind(this))
				}
				if(initialTransition){
					currentTransition.get("propertyTransitions").each(function(propertyTransition){
						initialTransition.get("propertyTransitions").each(function(copyFromPropertyTransition){
							if(copyFromPropertyTransition.get('name') == propertyTransition.get('name')){
								propertyTransition.set('from' , copyFromPropertyTransition.get('from'))
								propertyTransition.set('to' , copyFromPropertyTransition.get('to'))
							}
						})
					})
					
					toApplyTransition.get("propertyTransitions").each(function(propertyTransition){
						currentTransition.get("propertyTransitions").each(function(copyToPropertyTransition){
							if(copyToPropertyTransition.get('name') == propertyTransition.get('name')){
								copyToPropertyTransition.set('from', propertyTransition.get('from'))
								copyToPropertyTransition.set('to', propertyTransition.get('to'))
							}
						})
					})
				}
		}
		
		/*
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
			*/
			console.log('called change transition');
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
			console.log('params.index '  , params.index);
			console.log('params.animator ' , params.animator);
			this.animator = params.animator;
			this.model.set('index', params.index);
			var allTransitions = []
			//console.log(this.model)
			var allSupportedTransitions = AnimationPalete.getAllTransitions()
			for(var idx in allSupportedTransitions){
				allTransitions.push({label : idx, value : idx})
			}
			this.model.set('allTransitionsDropDown' , allTransitions)
			console.log('allTransitions ' ,allTransitions);
			
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