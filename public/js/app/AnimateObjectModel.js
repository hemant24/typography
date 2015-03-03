if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone.associations')
	var Transition = require('./Transition')

var AnimateObjectModel = Backbone.AssociatedModel.extend({
	relations:[{
		type:Backbone.Many,
		key:'transitionList',
		relatedModel: Transition
	}],
	defaults : {
		name : '',
		transitionList : []
	},
	initialize: function(){
		this.on('change', function(){
			console.log(this)
			console.log(this.get('fabricObject').set('text',this.get('name')))
			
			this.get('fabricObject').canvas.renderAll();
			console.log('Animated Object get changed')
		})
		this.on('change:transitionList[*].to', function(t){
			console.log('tranistionlist got changed')
			this._updateToAndFromOfTransitions(t);
		})
		this.on('change:transitionList[*].from', function(t){
			console.log('tranistionlist got changed')
			this._updateToAndFromOfTransitions(t);
		})
		this.on('change:transitionList[*]', function(t){
			console.log('tranistionlist got changed')
			//this._updateToAndFromOfTransitions(t);
			this._updateRegionIfRequired(t);
		})
		
	},
	_updateToAndFromOfTransitions : function(t){
		console.log('added transition is ', t)
		var indexOfChangedTransition = this.get("transitionList").indexOf(t);
		var aboveTranistion = this.get("transitionList").at(indexOfChangedTransition-1)
		var belowTransition = this.get("transitionList").at(indexOfChangedTransition+1)
		console.log('aboveTransition', aboveTranistion)
		if(aboveTranistion){
			aboveTranistion.set("to", parseFloat(t.get("from")))
		}
		if(belowTransition){
			belowTransition.set("from", parseFloat(t.get("to")))
		}
		console.log('belowTransition', belowTransition)
	},
	_updateRegionIfRequired : function(t){
			var indexOfChangedTransition = this.get("transitionList").indexOf(t)
			if(indexOfChangedTransition == 0){
				if(parseFloat(t.previous("from")) != parseFloat(t.get("from"))){
					this.get('region').update({start : parseFloat(t.get("from")), silent: true})
				}
			}
			if( (indexOfChangedTransition + 1) == this.get("transitionList").length){
				if(parseFloat(t.previous("to")) != parseFloat(t.get("to"))){
					this.get('region').update({end : parseFloat(t.get("to")),  silent: true})
				}
			}
	}
});
	
return AnimateObjectModel
})