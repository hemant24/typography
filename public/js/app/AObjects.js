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
			
	fabric.AImage = fabric.util.createClass(fabric.Image, fabric.util.object.extend(fabric.util.object.clone(AnimateObject), {type : 'aImage'}))
	fabric.AImage.async = true;

	fabric.AImage.fromObject  = function(object, callback){
		fabric.util.loadImage(object.src, function(img) {
		fabric.Image.prototype._initFilters.call(object, object, function(filters) {
				object.filters = filters || [ ];
				var instance = new fabric.AImage(img, object);
				callback && callback(instance);
			});
		}, null, object.crossOrigin);
	
		return new fabric.AImage(object.src, object);
	}
});