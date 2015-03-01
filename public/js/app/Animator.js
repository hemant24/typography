if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var fabric = require('./Fabric')
	var env = require('./Env')
	var Sequence = require('./Sequence')
	var fs = require('fs')
	var Properties = require('./Properties')
	//var async = require('async')
	
	var Animator = function(canvas, animateFor, playLength){
		this._objs = [];
//		console.log(canvas)
		this.canvas = canvas;
		this.playLength = playLength || 3000;
		//this.isPreview = isPreview,
		this.animateFor = animateFor || 'drawing';
		this.fps = 25;
	}
	var now = null;
	var frameCount = 0;
	Animator.prototype.add = function(obj){
		obj.canvas = this.canvas;
		this._objs.push(obj)
		//this.canvas.add(obj)
	}
	var tem = 0
	
	var _createFrames2 = function(a,b){
		
		var frames = [1, 2, 3, 4,5,6,7,8,9,10,11, 12, 13, 14,15,16,17,18,19,20,21, 22, 23, 24,25,26,27,28,29,30,31, 32, 33, 34,35,36,37,38,39,40];
		
		async.eachSeries(frames, function(frameNumber, callback) {
			console.log('frameNumber', frameNumber)
			this.seek(frameNumber);
			var stream = this.canvas.createPNGStream()
			var out = fs.createWriteStream(__dirname + '/output/frame-' + frameNumber +'.png');
			stream.on('data', function(chunk) {
				out.write(chunk);
			  });
			 
			  stream.on('end', function() {
				   out.end();
				  callback()
			  });
		}.bind(this))
		
	}
	
	var _createFrames = function(sequence, frameCount){
		if(!frameCount){
			frameCount = 0
		}
		frameCount++;
		if(fs!=null){
			
			var frameNumber = sequence.next();
			if(frameNumber == null){
				return 
			}
			this.seek(frameNumber);
			var stream = this.canvas.createPNGStream()
			var out = fs.createWriteStream(__dirname + '/output/frame-' + frameCount +'.png');
			console.log('creating frame : ',frameNumber)
			stream.on('data', function(chunk) {
				out.write(chunk);
			});
			stream.on('end', function() {
				out.end();
				//stream.unpipe(out);
				console.log('frame ' + frameNumber + 'created')
				if( frameNumber != null){
					_createFrames.call(this,sequence, frameCount)
				}
		    }.bind(this));
			//console.log(rect)
			/*
			stream.pipe(out, {end : false});
			stream.on('end', function(){
					//stream.unpipe(out);
					out.end();
					console.log('frame ' + frameNumber + 'created')
					if( frameNumber != null){
						_createFrames.call(this,sequence, frameCount)
					}
				}.bind(this))
			*/
		}else{
			console.log('invalid file system');
		}
		
		
	}
	Animator.prototype.play = function(){
		if(this.animateFor == 'server'){
			var sequence = new Sequence(0, this.playLength, 1000/this.fps);
			//var sequence = new Sequence(0, 202, 30);
			_createFrames.call(this, sequence)
			/*out = fs.createWriteStream(__dirname + '/output/' + '/helloworld.png');
var text = new fabric.AText('Hello world', new Properties());
this.canvas.add(text);
this.seek(200);
var stream = this.canvas.createPNGStream();
stream.on('data', function(chunk) {
  out.write(chunk);
});*/

			/*
			this.canvas.add(new fabric.Text("Hemant"))
			this.canvas.renderAll()
			var stream = this.canvas.createPNGStream()
			
			var out = fs.createWriteStream(__dirname + '/output/frame-test.png');
			stream.on('data', function(chunk) {
				out.write(chunk);
			})*/
			//_createFrames.call(this, sequence)
			
			/*var ds = 1000/this.fps;
			var i = 300
			this.seek(i)
			_saveFrame.call(this, i);*/
		}else{
			var start = new Date();
			var finish = start + this.playLength;
			var frameCount = 0;
			(function tick() {
				var ds = ( new Date()) - start
				
				var currentTime = ds > this.playLength ? this.playLength : ds
				//console.log('currenttime' , currentTime)
				this.seek(currentTime);
				_saveFrame.call(this,frameCount++);
				if (ds > this.playLength) {
				  return;
				}
				fabric.util.requestAnimFrame(tick.bind(this));
			}).call(this,start);
		}
		/*
		now = new Date()
		this.renderFrame();*/
		//this._objs[0].start()
	}
	Animator.prototype.seek = function(seekTime){
	
		var now = new Date()
		//console.log('animateFor', this.animateFor)
		console.log('total number of object in fabric canvas is : ' + this.canvas._objects.length)
		for(var i in this._objs){
			var obj = this._objs[i];
			//obj.updateCoords(seekTime);
			obj.updateCoords2(seekTime);
			_adjustCamera.call(this, obj);
		}
		console.log('updating logic took ' + (new Date() - now))
		//console.log(this.canvas)
		this.canvas.renderAll();
		console.log('updating graphics took' + (new Date() - now ))
	}
	var _saveFrame = function(frameNumber){
		if(fs!=null){
			var stream = this.canvas.createPNGStream()
			var out = fs.createWriteStream(__dirname + '/output/frame-' + frameNumber +'.png');
			console.log('creating frame : ',frameNumber)
			//console.log(rect)
			stream.pipe(out, {end : false});
			stream.on('end', function(){
					out.end();
					console.log('frame ' + frameNumber + 'created')
				})
		}else{
			console.log('invalid file system');
		}
	}
	var _adjustCamera = function(camera){
		if(camera.get('type') == 'aCamera' && (this.animateFor == 'server' || this.animateFor == 'preview' )){
			//console.log('okay this is camera')
			pinToCenter.call(this, camera)
		}
	}
	Animator.prototype.renderFrame = function(){
		var ds = ( new Date()) - now
		for(var i in this._objs){
			var obj = this._objs[i]
//			console.log(ds)
			//console.log(obj.get('type'))
			if(obj.get('type') == 'aRect' && this.animateFor == 'preview'){
				//console.log('okay this is camera')
				pinToCenter.call(this, obj)
				
			}
			if(obj.timeToAnimate(ds)){
				//console.log('yes animate object time to animate', obj)
				obj.start(ds);
				//console.log('after start')
			}
		}
		//console.log(this.renderFrame)
		
		this.canvas.renderAll()
		if(fs!=null){
			var stream = this.canvas.createPNGStream()
			var  out = fs.createWriteStream(__dirname + '/output/frame-' + frameCount +'.png');
			frameCount++;
			console.log('hello',frameCount)
			//console.log(rect)
			stream.pipe(out);
		}
		if(ds < this.playLength){
			_requestAnimFrame(this.renderFrame.bind(this))
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