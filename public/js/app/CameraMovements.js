
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

CameraMovements.moveRight = function(camera, objectParams, currentIndex, totalCount){
		var xDelta = 10;
		var currentObject = objectParams.object;
		var previousObjectLastKnownPosition = _getPreviousWordXY(objectParams);
		var x =  previousObjectLastKnownPosition.x + previousObjectLastKnownPosition.dx + xDelta + (currentObject.get('width')/2 ) ;
		var y =  previousObjectLastKnownPosition.y;
		_addCameraTransitions(camera, objectParams, {x : x, y:y});
	}
	
CameraMovements.moveDown = function(camera, objectParams, currentIndex, totalCount){
		var yDelta = 10;
		var currentObject = objectParams.object;
		var previousObjectLastKnownPosition = _getPreviousWordXY(objectParams);
		var x =  previousObjectLastKnownPosition.x;
		var y =  previousObjectLastKnownPosition.y + previousObjectLastKnownPosition.dy + yDelta;
		_addCameraTransitions(camera, objectParams, {x : x, y:y});
}

var _addCameraTransitions = function(camera, objectParams, to){
	var cameraEndDelta = 50;
	var cameraLastKnownPosition = _getCameraLastKnownXY(camera);
	console.log('adding camera transition from : ' + cameraLastKnownPosition.y + ' to : ' + to.y);
	camera
			.addTransition( new Transition({from : objectParams.startTime , to : objectParams.startTime + cameraEndDelta})
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : cameraLastKnownPosition.y, to : to.y}))	
					.addPropertyTransition(new PropertyTransition({name : 'left',  from : cameraLastKnownPosition.x, to : to.x}))	
			)
			.addTransition( new Transition({from : objectParams.startTime + cameraEndDelta , to : objectParams.endTime})
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : to.y, to : to.y}))	
					.addPropertyTransition(new PropertyTransition({name : 'left',  from : to.x, to : to.x}))	
			)
}

CameraMovements.moveCameraToInitialPosition = function(camera){
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
		
		camera
			.addTransition( new Transition({from : lastTransition.get('to') , to :lastTransition.get('to') +100})
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : lastKnownY, to : 200}))	
					.addPropertyTransition(new PropertyTransition({name : 'left',  from : lastKnownX, to : 300}))	
			)
	}
	

return CameraMovements

});