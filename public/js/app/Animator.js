if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var fabric = require('./Fabric')
	var env = require('./Env')
	var Sequence = require('./Sequence')
	var Properties = require('./Properties')
	try{
		require('three_new')
	}catch(e){
	
	}
	
	//console.log(THREE);
	
	/*
	THREE = require('three.js')
	require('three.js', function(t){
		console.log('loaded node three.js ' )
		THREE = t;
	}, function(err){
		var failedId = err.requireModules && err.requireModules[0]
		if (failedId === 'three.js') {
			requirejs.undef(failedId);
		}
	})*/
	

	//var async = require('async')
	var cameraH = 240;
	var cameraW = 426;
	var Animator = function(canvas, animateFor, playLength, enable3d){
		this._objs = [];
//		console.log(canvas)
		this.canvas = canvas;
		this.playLength = playLength || 3000;
		if(!enable3d){
			this.enable3d = false;
		}else{
			this.enable3d = enable3d;
		}
		
		//this.isPreview = isPreview,
		this.animateFor = animateFor || 'drawing';
		this.camera = null;
		this.cameraHeight = cameraH;
		this.cameraWidth = cameraW;
		this.fps = 25;
		if(enable3d){
			this.webGlCanvas = new WebGlCanvas(this)
		}
	}
	
	var WebGlCanvas = function(animator){
		this.animator = animator
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, cameraW/ cameraH, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer();
		this.domEl = this.renderer.domElement
		//var webGLRenderer = new THREE.WebGLRenderer();
		this.renderer.setClearColor(new THREE.Color(0xbbbbbb, 1.0));
		this.renderer.setSize(cameraW, cameraH);
		this.renderer.shadowMapEnabled = true;
		
		function createMesh(geom) {
			var canvasMap = new THREE.Texture(this.animator.canvas.lowerCanvasEl);
			var mat = new THREE.MeshPhongMaterial();
			mat.map = canvasMap;
			var mesh = new THREE.Mesh(geom, mat);
			return mesh;
		}
			
		this.cube = createMesh.call(this, new THREE.BoxGeometry(15,15,15));
		this.cube.position.x = 0;
		this.cube.position.y = 0;
		this.scene.add(this.cube);
		
		this.camera.position.x = 00;
		this.camera.position.y = 00;
		this.camera.position.z = 30;
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		var ambiLight = new THREE.AmbientLight( 0xffffff);
		this.scene.add(ambiLight);

		var light = new THREE.DirectionalLight();
		light.position.set(0, 0, 20);
		//this.scene.add(light);
	}
	
	WebGlCanvas.prototype.renderAll = function(){
		this.cube.rotation.y += 0.02;
		this.cube.material.map.needsUpdate = true;
		this.renderer.render(this.scene, this.camera);
	}
	
	var now = null;
	var frameCount = 0;
	
	Animator['getCameraHeight'] = function(){
		return cameraH
	}
	
	Animator['getCameraWidth'] = function(){
		return cameraW
	}
	
	Animator.prototype.add = function(obj){
		obj.canvas = this.canvas;
		this._objs.push(obj)
		//this.canvas.add(obj)
	}
	Animator.prototype.initializeCamera = function(camera){
		camera.lockScalingX = true;
		camera.lockScalingY = true;
		camera.lockRotation = true;
		camera.perPixelTargetFind = true;
		camera.set('height',this.cameraHeight);
		camera.set('width',this.cameraWidth);
		camera.saveToStartState();
		//this.canvas.add(obj)
	}
	Animator.prototype.addGridLines = function(color){
		console.log('called add grid lines ', color)
		this.canvas.add(new fabric.Line([0, -1000, 0, 1000], {
			stroke: color,
			selectable  : false
		}));
		this.canvas.add(new fabric.Line([-1000,0, 1000, 0], {
			stroke: color,
			selectable  : false
		}));
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
		//console.log('total number of object in fabric canvas is : ' + this.canvas._objects.length)
		for(var i in this._objs){
			var obj = this._objs[i];
			obj.updateCoords(seekTime);
			_adjustCamera.call(this, obj);
		}
		//console.log('updating logic took ' + (new Date() - now))
		//console.log(this.canvas)
		this.canvas.renderAll();
		if(this.enable3d){
			this.webGlCanvas.renderAll();
		}
		/*
		this.webGlOptions.cube.material.map.needsUpdate = true;
		this.webGlOptions.renderer.render(this.webGlOptions.scene, this.webGlOptions.camera);
		*/
		//console.log('updating graphics took' + (new Date() - now ))
	}
	Animator.prototype.getCamera = function(){
		if(this.camera){
			return this.camera;
		}
		for(var i in this._objs){
			var obj = this._objs[i];
			//console.log('type is ' + obj.get('type'))
			if(obj.get('type') == 'aCamera'){
				this.camera = obj;
				return this.camera;
			}
		}
	}
	var _adjustCamera = function(camera){
		if(camera.get('type') == 'aCamera' && (this.animateFor == 'server' || this.animateFor == 'preview' )){
			//console.log('okay this is camera');
			//console.log('camera is ' , camera)
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
		var resolutionFactor = obj.get('resolutionFactor')
		console.log('camera resolutionFactor is '  + obj.get('resolutionFactor'))
		this.canvas.setZoom(resolutionFactor * scaleLevel)
		//obj.setCoords() why it is not working
		var canvasCenterPoint = new fabric.Point(this.canvas.getCenter().left, this.canvas.getCenter().top)
		var objectCenterPoint = obj.getCenterPoint();
		
		//obj.setCoords()
		
		//console.log(objectCenterPoint.subtract(canvasCenterPoint))
		//console.log(objectCenterPoint.subtract(canvasCenterPoint).multiply(2))
		this.canvas.absolutePan(objectCenterPoint.multiply(resolutionFactor * scaleLevel).subtract(canvasCenterPoint))
		//this.canvas.absolutePan(objectCenterPoint.subtract(canvasCenterPoint))
		
		//this.canvas.zoomToPoint(objectCenterPoint.subtract(canvasCenterPoint), 1.3)
			//console.log(obj.getCenterPoint())
			
	}
		
	
	
	
	return Animator
});