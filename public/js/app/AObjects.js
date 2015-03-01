if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var fabric = require('./Fabric')
	var AnimateObject = require('./AnimateObject')

	fabric.AText = fabric.util.createClass(fabric.Text, fabric.util.object.extend(fabric.util.object.clone(AnimateObject), {type : 'aText'}))

	fabric.AText.fromObject  = function(object){
				return new fabric.AText(object.text, object);
			} 
			
	fabric.ACamera = fabric.util.createClass(fabric.Rect, fabric.util.object.extend(fabric.util.object.clone(AnimateObject), {type : 'aCamera', quality : 1}))

	fabric.ACamera.fromObject  = function(object){
				return new fabric.ACamera(object);
			}
		
});