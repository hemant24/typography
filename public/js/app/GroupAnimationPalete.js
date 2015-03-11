
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Transition = require('./Transition');
	var PropertyTransition = require('./PropertyTransition');
	var AnimationPalete = require('./AnimationPalete');
	var CameraMovements = require('./CameraMovements');
	var GroupAnimationPalete = {}
	
	
	/**
	*	objectParams.startTime
	*	objectParams.object
	*
	*	cameraParams.trackObject : true or false.
	*   cameraParams.camera : camera instance.
	*	cameraParmas.initialX : 
	*	cameraParams.initialY :
	*	cameraParams.adjustZoomLevel : true or false.
	*	
	*	groupParams.startTime : group start time.
	*	groupParams.endTime : group end time.
	*	groupParams.totalObject : total number of objects in group.
	*	groupParams.currentObjectIndex : index of current object for which transition is being calculated.
	*	
	*	animationParams.animationPalete
	*/
	GroupAnimationPalete.topBottom = function(objectParams, cameraParams, groupParams, animationParams){
		/*console.log('objectParams', objectParams)
		console.log('cameraParams', cameraParams)
		console.log('groupParams', groupParams)*/
		var aTiming = getEnterLeaveTime(objectParams.startTime, groupParams.endTime);
		//_adjustObjectStartingPosition(objectParams, groupParams.currentObjectIndex, groupParams.totalObject);
		//_addCameraTransitions(cameraParams.camera, objectParams);
		if(groupParams.currentObjectIndex != 1){
			var random = getRandomValue(2);
			if(random > 0 && random <= 1){
				//_addjustCamera(cameraParams.camera, objectParams, groupParams.currentObjectIndex, groupParams.totalObject);
				CameraMovements.moveDown(cameraParams.camera, objectParams, groupParams.currentObjectIndex, groupParams.totalObject);
			}else{
				CameraMovements.moveRight(cameraParams.camera, objectParams, groupParams.currentObjectIndex, groupParams.totalObject);
			}
		}
		//console.log('adding animation pallete', objectParams.object, 'start time is ' ,objectParams.startTime , 'end time is ',  groupParams.endTime)
		AnimationPalete.addTransitionToObject(animationParams.transitionName, objectParams.object, objectParams.startTime, groupParams.endTime, cameraParams.camera, aTiming);
		if(groupParams.currentObjectIndex == groupParams.totalObject){
			//_moveCameraToInitialPosition(cameraParams.camera)
			CameraMovements.moveCameraToInitialPosition(cameraParams.camera);
		}
			
	}
	
	var getRandomValue = function(upper){
		var index = Math.floor(Math.random() * upper);
		return index;
	}
	
	var _adjustObjectStartingPosition = function(objectParams, currentIndex, totalCount){
		var object = objectParams.object;
		var yDelta = 10;
		var y = object.get('top');
		var x = object.get('left');
		y = currentIndex * (y + ( (object.get('height')/2 ) + yDelta));
		object.set('top',y);
		object.set('left',x);
	}
	
	var _addCameraTransitions = function(camera, objectParams){
		var object = objectParams.object;
		camera
				.addTransition( new Transition({from : objectParams.startTime , to : objectParams.startTime + 50})
						.addPropertyTransition(new PropertyTransition({name : 'top',  from : parseInt(camera.get('top')), to : object.get('top')}))	
						.addPropertyTransition(new PropertyTransition({name : 'left',  from : parseInt(camera.get('left')), to : object.get('left')}))	
				)
	}
	
	
	
	var getEnterLeaveTime = function(start, end){
		var eachWordDuration = end - start
		var enteringStartTime = start
		var eachWordEnterStartEndDt = parseInt(eachWordDuration * .07)
		var enteringEndTime = enteringStartTime + eachWordEnterStartEndDt
		var leavingStartTime = (start + eachWordDuration) -eachWordEnterStartEndDt
		var leavingEndTime = end
		return {
			enterStart : enteringStartTime,
			enterEnd : enteringEndTime,
			//leaveStart : leavingStartTime,
			leaveEnd : leavingEndTime
		}
	}

	return GroupAnimationPalete

});