var motionText = motionText || {};




(function(global){

	var Previewer = function(){
	}
	
	var previewCanvas = null;

	Previewer['preview'] = function(canvas){
		//$('#previewArea').modal({})
		previewCanvas = new fabric.Canvas('previewCanvas');
		var animator = new motionText.Animator(previewCanvas, true);
		var initialStateObjects = []
		console.log('canvas objects' , canvas.getObjects())
		initialStateObjects = canvas.getObjects().map(function(instance){
			var clonnedInstance = fabric.util.object.clone(instance)
			var clonnedObject = clonnedInstance.toObject()
			//console.log('clonnedObject', clonnedObject)
			//console.log('clonnedInstance.stateProperties', clonnedInstance.stateProperties)
			fabric.util.populateWithProperties(clonnedInstance.startState, clonnedObject , clonnedInstance.stateProperties)
			return clonnedObject
		}, canvas)
		
		console.log('initiating canvas with' , {background : '' , objects : initialStateObjects})

		previewCanvas.loadFromJSON({background : '' , objects : initialStateObjects}, function(){
			console.log('called loadFromJSON complete')
			console.log(animator)
			//previewCanvas.setZoom(2)
			animator.play()
			//previewCanvas.renderAll();
			//startAnimation();
		}, function(o, object){
			animator.add(object)
		} )
	}
	
	var startAnimation = function(){
		var zoomInOrOut = -1
		function pinToCenter(obj){
			
			var canvasCenterPoint = new fabric.Point(previewCanvas.getCenter().left,previewCanvas.getCenter().top)
			var objectCenterPoint = obj.getCenterPoint();
			previewCanvas.zoomToPoint(new fabric.Point(previewCanvas.getCenter().left,previewCanvas.getCenter().top), 1)
			previewCanvas.absolutePan(objectCenterPoint.subtract(canvasCenterPoint))
			setTimeout(function(){
				if(zoomInOrOut == -1){
					previewCanvas.zoomToPoint(new fabric.Point(previewCanvas.getCenter().left,previewCanvas.getCenter().top), 1.2)
					zoomInOrOut = 1
				}else{
					previewCanvas.zoomToPoint(new fabric.Point(previewCanvas.getCenter().left,previewCanvas.getCenter().top), 0.8)
					zoomInOrOut = -1
				}
			}, 1000)
			
			//console.log(obj.getCenterPoint())
			
		}
		var toFocusObjectList = []
		
		for (var i = 0, len = previewCanvas._objects.length; i < len; i++) {
			toFocusObjectList.push(previewCanvas._objects[i])
			
		}
		
		var interval = setInterval(function(){ 
			var toFocusObject = toFocusObjectList.splice(0,1)
			if(toFocusObject.length == 0){
				 clearTimeout(interval)
			}else{
				pinToCenter(toFocusObject[0])
			}
		}, 3000);
	}
	
	motionText.Previewer = Previewer;
})(window)