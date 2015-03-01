var motionText = motionText || {};




(function(global){

	var Animator = function(canvas, isPreview){
		this._objs = [];
		console.log(canvas)
		this.canvas = canvas;
		this.playLength = 4000;
		this.isPreview = isPreview
	}
	var now = null;
	Animator.prototype.add = function(obj){
		this._objs.push(obj)
		this.canvas.add(obj)
	}
	Animator.prototype.play = function(){
		now = new Date()
		this.renderFrame();
		//this._objs[0].start()
	}
	Animator.prototype.renderFrame = function(){
		var ds = ( new Date()) - now
		for(var i in this._objs){
			var obj = this._objs[i]
			console.log(ds)
			console.log(obj.get('type'))
			if(obj.get('type') == 'aRect' && this.isPreview == true){
				console.log('okay this is camera')
				pinToCenter.call(this, obj)
				
			}
			if(obj.timeToAnimate(ds)){
				console.log('yes animate object time to animate', obj)
				obj.start(ds);
				console.log('after start')
			}
		}
		//console.log(this.renderFrame)
		
		this.canvas.renderAll()
		if(ds < this.playLength){
			requestAnimationFrame(this.renderFrame.bind(this))
		}
	}
	
	function pinToCenter(obj){
		this.canvas.setZoom(2)
		//obj.setCoords() why it is not working
		var canvasCenterPoint = new fabric.Point(this.canvas.getCenter().left, this.canvas.getCenter().top)
		var objectCenterPoint = obj.getCenterPoint();
		
		//obj.setCoords()
		
		console.log(objectCenterPoint.subtract(canvasCenterPoint))
		console.log(objectCenterPoint.subtract(canvasCenterPoint).multiply(2))
		this.canvas.absolutePan(objectCenterPoint.multiply(2).subtract(canvasCenterPoint))
		//this.canvas.absolutePan(objectCenterPoint.subtract(canvasCenterPoint))
		
		//this.canvas.zoomToPoint(objectCenterPoint.subtract(canvasCenterPoint), 1.3)
			//console.log(obj.getCenterPoint())
			
	}
		
	
	
	
	motionText.Animator = Animator;
})(window)