
var motionText = require('./AnimateObject')
var fabric = require('fabric').fabric;


console.log('extend' , fabric.util.object.extend(fabric.util.object.clone(motionText.motionText.AnimateObject), {type : 'aText'}))

fabric.AText = fabric.util.createClass(fabric.Text, fabric.util.object.extend(fabric.util.object.clone(motionText.motionText.AnimateObject), {type : 'aText'}))

fabric.AText.fromObject  = function(object){
			return new fabric.AText(object.text, object);
		} 
		
fabric.ARect = fabric.util.createClass(fabric.Rect, fabric.util.object.extend(fabric.util.object.clone(motionText.motionText.AnimateObject), {type : 'aRect'}))

fabric.ARect.fromObject  = function(object){
			return new fabric.ARect(object);
		}