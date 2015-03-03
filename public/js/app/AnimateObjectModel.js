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
		this.on('change:transitionList[*]', function(t){
			console.log('tranistionlist got changed')
			
			var indexOfChangedTransition = this.get("transitionList").indexOf(t)
			if(indexOfChangedTransition == 0){
				console.log('okay first transition got chagned')
				console.log('setting start to ' + t.get("from"))
				this.get('region').update({start : parseFloat(t.get("from")), silent: true})
			}
			if( (indexOfChangedTransition + 1) == this.get("transitionList").length){
				console.log('okay last transition got chagned')
				console.log('transition previous from ' , + t.previous("from"))
				console.log('transition now from ' , + t.get("from"))
				
				console.log('transition previous to ' , + t.previous("to"))
				console.log('transition now to ' , + t.get("to"))
				
				
				console.log('setting last to ' + t.get("to"))
				if(parseFloat(t.previous("to")) != parseFloat(t.get("to"))){
					this.get('region').update({end : parseFloat(t.get("to")),  silent: true})
				}
			}
			//console.log(this.get("transitionList").length)
			//console.log('index of changed tranistion is ' + this.get("transitionList").indexOf(t))
			//console.log(t)
		})
	}
});
	
return AnimateObjectModel
})