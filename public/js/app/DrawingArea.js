if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {

	var fabric = require('fabric')
	//Private
	var canvasIntialPoint = new fabric.Point(0,0)
	var canvasDxPoint = new fabric.Point(0,0)
	var isMouseDown = false
	var pX = 0
	var pY = 0
	
	var DrawingArea = function(canvas, selector){
		this.canvas = canvas;
		this.canvas.selection = false
		this.canvas.setDimensions({width : $(selector).width(), height : $(selector).height()})
		addCanvasEvent.call(this);
	}
	function addCanvasEvent(){
		this.canvas.on('mouse:down', function(a){
			//var zoomPoint = new fabric.Point(a.e.clientX, a.e.clientY)
				//canvas.zoomToPoint(zoomPoint, 1.5)
				var anyElActive = false
			  var x = a.e.x;
			  var y = a.e.y;

			  
			  x -= a.e.offsetX;
			  y -= a.e.offsetY;
			  
		  
			for (var i = 0, len = this.canvas._objects.length; i < len; i++) {
				if(this.canvas._objects[i].active){
					anyElActive = true;
					break;
				}
			}
			pX = a.e.clientX
			pY = a.e.clientY
			//console.log('mouse down' , a.e.clientX, a.e.clientY)
			
			//console.log('fater' , text2.getCenterPoint())
			if(!anyElActive){
				isMouseDown = true
			}
		}.bind(this))

		this.canvas.on('mouse:up' , function(a){
			//console.log('mouse up' )
			if(isMouseDown == true){
				canvasIntialPoint = canvasIntialPoint.add(canvasDxPoint)
			}
			isMouseDown = false
		})
		
		this.canvas.on('mouse:out' , function(a){
			//console.log('mouse out' )
			isMouseDown = false
		})

		this.canvas.on('mouse:move' , function(a){
			//console.log('mouse moving' )
			if(isMouseDown){
				var dX = pX - a.e.clientX
				var dY = pY - a.e.clientY
				console.log('mouse is moving' , a.e.clientX, a.e.clientY)
				
				var dxPoint = new fabric.Point(dX,dY)
				var toMove = canvasIntialPoint.add(dxPoint)
				console.log('difference Point dx, dy', dxPoint)
				console.log('initial Point ' , toMove)
				canvasDxPoint = dxPoint
				this.canvas.absolutePan(toMove)

			}
		}.bind(this))
	
	}


	
	
	
	return DrawingArea;
});