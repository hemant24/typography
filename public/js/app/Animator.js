if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var fabric = require('./Fabric')
	var env = require('./Env')
	var Sequence = require('./Sequence')
	var Properties = require('./Properties')
	//var async = require('async')
	
	var Animator = function(canvas, animateFor, playLength){
		this._objs = [];
//		console.log(canvas)
		this.canvas = canvas;
		this.playLength = playLength || 3000;
		//this.isPreview = isPreview,
		this.animateFor = animateFor || 'drawing';
		this.camera = null;
		this.fps = 25;
	}
	var now = null;
	var frameCount = 0;
	
	
	Animator.prototype.add = function(obj){
		obj.canvas = this.canvas;
		this._objs.push(obj)
		//this.canvas.add(obj)
	}
	
	Animator.prototype.play = function(){
		var start = new Date();
		var finish = start + this.playLength;
		var frameCount = 0;
		(function tick() {
			var ds = ( new Date()) - start
			
			var currentTime = ds > this.playLength ? this.playLength : ds
			this.seek(currentTime);
			if (ds > this.playLength) {
			  return;
			}
			fabric.util.requestAnimFrame(tick.bind(this));
		}).call(this,start);
	}
	Animator.prototype.seek = function(seekTime){
		var now = new Date()
		//console.log('animateFor', this.animateFor)
		console.log('total number of object in fabric canvas is : ' + this.canvas._objects.length)
		for(var i in this._objs){
			var obj = this._objs[i];
			obj.updateCoords(seekTime);
			_adjustCamera.call(this, obj);
		}
		console.log('updating logic took ' + (new Date() - now))
		//console.log(this.canvas)
		this.canvas.renderAll();
		console.log('updating graphics took' + (new Date() - now ))
	}
	Animator.prototype.getCamera = function(){
		if(this.camera){
			return this.camera;
		}
		for(var i in this._objs){
			var obj = this._objs[i];
			console.log('type is ' + obj.get('type'))
			if(obj.get('type') == 'aCamera'){
				this.camera = obj;
				return obj;
			}
		}
	}
	var _adjustCamera = function(camera){
		if(camera.get('type') == 'aCamera' && (this.animateFor == 'server' || this.animateFor == 'preview' )){
			//console.log('okay this is camera')
			pinToCenter.call(this, camera)
		}
	}
	
	  var _requestAnimFrame = fabric.window.requestAnimationFrame       ||
                          fabric.window.webkitRequestAnimationFrame ||
                          fabric.window.mozRequestAnimationFrame    ||
                          fabric.window.oRequestAnimationFrame      ||
                          fabric.window.msRequestAnimationFrame     ||
                          function(callback) {
                            fabric.window.setTimeout(callback, 1000 / 60);
                          };
						  
	function pinToCenter(obj){
		console.log('camera quality is '  + obj.get('quality'))
		var scaleLevel = obj.get('quality')
		this.canvas.setZoom(scaleLevel)
		//obj.setCoords() why it is not working
		var canvasCenterPoint = new fabric.Point(this.canvas.getCenter().left, this.canvas.getCenter().top)
		var objectCenterPoint = obj.getCenterPoint();
		
		//obj.setCoords()
		
		//console.log(objectCenterPoint.subtract(canvasCenterPoint))
		//console.log(objectCenterPoint.subtract(canvasCenterPoint).multiply(2))
		this.canvas.absolutePan(objectCenterPoint.multiply(scaleLevel).subtract(canvasCenterPoint))
		//this.canvas.absolutePan(objectCenterPoint.subtract(canvasCenterPoint))
		
		//this.canvas.zoomToPoint(objectCenterPoint.subtract(canvasCenterPoint), 1.3)
			//console.log(obj.getCenterPoint())
			
	}
		
	
	
	
	return Animator
});