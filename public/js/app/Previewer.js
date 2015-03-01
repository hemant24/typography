if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {

	require('./AObjects')
	var Animator = require('./Animator')
	var env = require('./Env')
	
	
	var fabric = require('./Fabric')

	var Previewer = function(){
	}
	
	var previewCanvas = null;
	
	Previewer['animatorToJSON'] = function(animator, canvas){
		var objectsToSerialize = []
		for(var i in animator._objs){
			objectsToSerialize.push(animator._objs[i].toObject())
		}
		canvas.getObjects().map(function(instance){
			if(instance.get('type') == 'aCamera'){
				objectsToSerialize.push(instance.toObject())
			}
		})
		
		return {background : '' , objects : objectsToSerialize}
		
	}
	
	Previewer['canvasToJSON'] = function(canvas){
		var initialStateObjects = []
		initialStateObjects = canvas.getObjects().map(function(instance){
			var clonnedInstance = fabric.util.object.clone(instance)
			var clonnedObject = clonnedInstance.toObject()
			//console.log('clonnedObject', clonnedObject)
			//console.log('clonnedInstance.stateProperties', clonnedInstance.stateProperties)
			fabric.util.populateWithProperties(clonnedInstance.startState, clonnedObject , clonnedInstance.stateProperties)
			return clonnedObject
		}, canvas)
		return {background : '' , objects : initialStateObjects}
	}
	
	Previewer['preview'] = function(canvasJSON, playLength, quality){
		if(!quality){
			quality = 1
		}
		var animateFor = 'preview'
		//console.log('initiating canvas with' , canvasJSON)
		console.log('evn is ' , env)
		console.log('playLength is ' , playLength)
		if(env == 'node'){
			animateFor = 'server';
			previewCanvas = fabric.createCanvasForNode(300 * quality, 300 * quality);
		}else{
			previewCanvas = new fabric.Canvas('previewCanvas');
		}
		var animator = new Animator(previewCanvas, animateFor, playLength);
		//animator.play()
		previewCanvas.loadFromJSON(canvasJSON, function(){
			//console.log('called loadFromJSON complete')
			for(var i in animator._objs){
				var objectToRemove = animator._objs[i];
				if(objectToRemove.get('type') != 'aCamera'){
					previewCanvas.remove(objectToRemove);
				}else{
					objectToRemove.set('quality', quality)
				}
			}
			//console.log('animator', animator)
			//console.log('objects in cnavas' , previewCanvas.getObjects())
			//previewCanvas.setZoom(2)
			animator.play()
			//animator.seek( $("#seekTime").val())
			//previewCanvas.renderAll();
			//startAnimation();
		}, function(o, object){
			//console.log(this)
			//console.log(object)
			animator.add(object)
			//console.log('removed :' , previewCanvas.remove(object))
		} )
	}
	
	
	
	
	
	return Previewer;
  });