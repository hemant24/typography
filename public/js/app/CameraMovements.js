
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Transition = require('./Transition');
	var PropertyTransition = require('./PropertyTransition');
	
	
var CameraMovements = {}

var _getCameraLastKnownXY = function(camera){
	var transitionList = camera.get('transitionList');
	var lastKnownX = camera.get('left');
	var lastKnownY = camera.get('top');
	if(transitionList && transitionList.length && transitionList.length > 0){
		var lastTransition = transitionList[transitionList.length - 1];
		lastTransition.get('propertyTransitions').each(function(propTrans){
						if(propTrans.get('name') == 'top'){
							lastKnownY = propTrans.get('to');
						}
						if(propTrans.get('name') == 'left'){
							lastKnownX = propTrans.get('to');
						}
					})
	}
	return {
		x : lastKnownX,
		y : lastKnownY
	}
}

var _getPreviousWordXY = function(objectParams){
	var x = objectParams.object.get('left')
	var y = objectParams.object.get('top')
	var previousObject = null;
	if(objectParams.previousObjectList && objectParams.previousObjectList.length && objectParams.previousObjectList.length > 0){
			previousObject = objectParams.previousObjectList[objectParams.previousObjectList.length - 2];
			console.log('previousObject', previousObject)
		}
	var previousObjectTransitionList = previousObject ? previousObject.get('transitionList') : []
	console.log('previousObjectTransitionList', previousObjectTransitionList)
	if(previousObjectTransitionList && previousObjectTransitionList.length && previousObjectTransitionList.length > 0){
		var firstTransition = previousObjectTransitionList[0];
		firstTransition.get('propertyTransitions').each(function(propTrans){
						if(propTrans.get('name') == 'left'){
							console.log('previous object left is ' + propTrans.get('to'));
							x = propTrans.get('to');
						}
						if(propTrans.get('name') == 'top'){
							console.log('previous object top is ' + propTrans.get('to'));
							y = propTrans.get('to');
						}
					})
	}
	var dx = 0;
	var dy = 0;
	if(previousObject){
			dx = previousObject.get('width')/2;
			dy = previousObject.get('height')/2;
		}
	return {
		x : x,
		y : y,
		dx : dx,
		dy : dy
	}
}

var getObjectFutureXY = function(object){
	var x = object.get('left');
	var y = object.get('top');
	var objectTransitionList = object ? object.get('transitionList') : []
	if(objectTransitionList && objectTransitionList.length && objectTransitionList.length > 0){
		var firstTransition = objectTransitionList[0];
		firstTransition.get('propertyTransitions').each(function(propTrans){
						if(propTrans.get('name') == 'left'){
							x = propTrans.get('to');
						}
						if(propTrans.get('name') == 'top'){
							y = propTrans.get('to');
						}
					})

	}
	return { x : x, y : y}
}
var getTextHeight = function(object) {
  var font = object.get('fontSize') + 'px ' + object.get('fontFamily')
  console.log('called get Rect corred with font ' + font);
  var text = $('<span>' + object.get('text')+'</span>').css({ font: font });
  var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');
  var div = $('<div></div>');
  div.append(text, block);
  var body = $('body');
  body.append(div);

  try {
    var result = {};
    block.css({ verticalAlign: 'baseline' });
    result.ascent = block.offset().top - text.offset().top;

    block.css({ verticalAlign: 'bottom' });
    result.height = block.offset().top - text.offset().top;

    result.descent = result.height - result.ascent;

  } finally {
    div.remove();
  }

  return result;
};


var getRectCoord = function(centerPoint, object){
	var topLeftX = centerPoint.x - (object.get('width')/2)
	var topLeftY = centerPoint.y - (getTextHeight(object).height/2);//object.get('height')/2
	
	var topRightX = centerPoint.x + (object.get('width')/2)
	var topRightY = centerPoint.y - (getTextHeight(object).height/2);//object.get('height')/2
	
	var bottomRightX = centerPoint.x + (object.get('width')/2)
	var bottomRightY = centerPoint.y + (getTextHeight(object).height/2);//object.get('height')/2
	
	var bottomLeftX = centerPoint.x - (object.get('width')/2)
	var bottomLeftY = centerPoint.y + (getTextHeight(object).height/2);//object.get('height')/2
	
	return {
		topLeftX : topLeftX,
		topLeftY : topLeftY,
		topRightX : topRightX,
		topRightY : topRightY,
		bottomLeftX : bottomLeftX,
		bottomLeftY : bottomLeftY,
		bottomRightX : bottomRightX,
		bottomRightY : bottomRightY,
	}
}

var returnDeltaXYIfColliding = function(currentXY, objectParams, direction){
	var currentObject = objectParams.object;
	var currentRect = getRectCoord({x : currentXY.x, y : currentXY.y}, objectParams.object) 
	if(objectParams.previousObjectList && objectParams.previousObjectList.length && objectParams.previousObjectList.length > 0){
		for(var i = 0 ; i <= (objectParams.previousObjectList.length -2 ); i++){
			var previousObject = objectParams.previousObjectList[i];
			//var previousObjectCenterPoint = getObjectFutureXY(previousObject);
			//var previousRect = getRectCoord(previousObjectCenterPoint, previousObject)
			_adjustIfColliding(currentObject, currentXY, previousObject, direction);
			/*
			if(ifColliding(currentRect, previousRect)){
				console.log('yes ', currentObject.get('text') , ' is colliding with ', previousObject.get('text'));
			}*/
		}
	}
}

var _adjustIfColliding = function(currentObject, currentXY, previousObject, direction, numberOfIteration){
	if(!numberOfIteration){
		numberOfIteration = 0;
	}
	var currentRect = getRectCoord({x : currentXY.x, y : currentXY.y}, currentObject)
	var previousObjectCenterPoint = getObjectFutureXY(previousObject);
	var previousRect = getRectCoord(previousObjectCenterPoint, previousObject)
	if(ifColliding(currentRect, previousRect)){
		numberOfIteration++;
		console.log('yes ', currentObject.get('text') , ' is colliding with ', previousObject.get('text'));
		console.log('so adjusting with 10 px each')
		if(direction == 'x'){
			currentXY.x = currentXY.x + 3;
		}
		if(direction == 'y'){
			currentXY.y = currentXY.y + 3;
		}
		if(	numberOfIteration > 20){
			console.log('increase the number of iteration')
			return ;
			//do nothing
		}else{
			_adjustIfColliding(currentObject, currentXY, previousObject, direction, numberOfIteration);
		}
	}else{
		return;
		// do nothing, 
	}
}

var ifColliding = function(rect1, rect2){
	 var tl = new fabric.Point(rect1.topLeftX, rect1.topLeftY);
	 var tr = new fabric.Point(rect1.topRightX, rect1.topRightY);
	 var bl = new fabric.Point(rect1.bottomLeftX, rect1.bottomLeftY);
	 var br = new fabric.Point(rect1.bottomRightX, rect1.bottomRightY);
		  
	intersection = fabric.Intersection.intersectPolygonRectangle(
            [tl, tr, br, bl],
            new fabric.Point(rect2.topLeftX , rect2.topLeftY+30),
			new fabric.Point(rect2.bottomRightX , rect2.bottomRightY - 30)
          );
      return intersection.status === 'Intersection'; 
}

CameraMovements.moveRight = function(camera, objectParams, currentIndex, totalCount, audioTrack){
	var xDelta = 10;
	var currentObject = objectParams.object;
	var previousObjectLastKnownPosition = _getPreviousWordXY(objectParams);
	var x =  previousObjectLastKnownPosition.x + previousObjectLastKnownPosition.dx + xDelta + (currentObject.get('width')/2 ) ;
	var y =  previousObjectLastKnownPosition.y;
	var to = {x : x , y : y}
	returnDeltaXYIfColliding(to, objectParams, 'x');
	return _addCameraTransitions(camera, objectParams, to, audioTrack);
}
	
CameraMovements.moveDown = function(camera, objectParams, currentIndex, totalCount, audioTrack){
	var yDelta = 10;
	var currentObject = objectParams.object;
	var previousObjectLastKnownPosition = _getPreviousWordXY(objectParams);
	var x =  previousObjectLastKnownPosition.x;
	var y =  previousObjectLastKnownPosition.y + previousObjectLastKnownPosition.dy + yDelta;
	var to = {x : x , y : y}
	returnDeltaXYIfColliding(to, objectParams, 'y');
	return _addCameraTransitions(camera, objectParams, to, audioTrack);
}

var _addCameraTransitions = function(camera, objectParams, to, audioTrack){
	var cameraEndDelta = 50;
	var cameraLastKnownPosition = _getCameraLastKnownXY(camera);
	console.log('adding camera Y transition from : ' + cameraLastKnownPosition.y + ' to : ' + to.y);
	console.log('adding camera X transition from : ' + cameraLastKnownPosition.x + ' to : ' + to.x);
	var movementTransition =  new Transition({from : objectParams.startTime , to : objectParams.startTime + cameraEndDelta})
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : cameraLastKnownPosition.y, to : to.y}))	
					.addPropertyTransition(new PropertyTransition({name : 'left',  from : cameraLastKnownPosition.x, to : to.x}));
	camera
			.addTransition( movementTransition )
			.addTransition( new Transition({from : objectParams.startTime + cameraEndDelta , to : objectParams.endTime})
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : to.y, to : to.y}))	
					.addPropertyTransition(new PropertyTransition({name : 'left',  from : to.x, to : to.x}))	
			)
	return movementTransition
	//audioTrack.addCameraRegion({camera : camera, startTime : objectParams.startTime, endTime : objectParams.startTime + cameraEndDelta});
	//audioTrack.addCameraRegion({camera : camera, startTime : objectParams.startTime + cameraEndDelta, endTime : objectParams.endTime});
}

CameraMovements.moveCameraToInitialPosition = function(camera, audioTrack){
		console.log('this is group last text so adding transition to move camera to inital location');
		var transitionList = camera.get('transitionList')
		var lastTransition = transitionList[transitionList.length - 1];
		var lastKnownX = camera.get('left');
		var lastKnownY = camera.get('top');
		if(transitionList && transitionList.length && transitionList.length > 0){
			var lastTransitionL = transitionList[transitionList.length - 1];
			lastTransitionL.get('propertyTransitions').each(function(propTrans){
							if(propTrans.get('name') == 'top'){
								lastKnownY = propTrans.get('to');
							}
							if(propTrans.get('name') == 'left'){
								lastKnownX = propTrans.get('to');
							}
						})
		}
		var transition = new Transition({from : lastTransition.get('to') , to :lastTransition.get('to') +100})
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : lastKnownY, to : 200}))	
					.addPropertyTransition(new PropertyTransition({name : 'left',  from : lastKnownX, to : 300}));
		camera
			.addTransition(	
				transition
			)
		return transition;
	}
	

return CameraMovements

});