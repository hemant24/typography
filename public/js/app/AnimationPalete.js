
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Transition = require('./Transition');
	var PropertyTransition = require('./PropertyTransition');
	var AnimationPalete = {}
	
	
	var _setXandYOfObject = function(object, refObject){
		var transitionList = refObject.get('transitionList')
		var lastKnownX = refObject.get('left');
		var lastKnowY = refObject.get('top');
		console.log('seting x y of obj', transitionList);
		if(transitionList && transitionList.length && transitionList.length > 0){
			var lastTransition = transitionList[transitionList.length - 1];
			lastTransition.get('propertyTransitions').each(function(propTrans){
							if(propTrans.get('name') == 'top'){
								lastKnowY = propTrans.get('to');
							}
							if(propTrans.get('name') == 'left'){
								lastKnownX = propTrans.get('to');
							}
						})
		}
		object.set('left', lastKnownX);
		object.set('top', lastKnowY);
	}
	/*
	AnimationPalete.topBottom = function(object, start, end, refObject, enterLeaveTime){
		AnimationPalete.addTransitionToObject('topBottom', object, start, end, refObject, enterLeaveTime);

	}
	
	AnimationPalete.behindFront = function(object, start, end, refObject, enterLeaveTime){
		AnimationPalete.addTransitionToObject('behindFront', object, start, end, refObject, enterLeaveTime);	
	}
	
	AnimationPalete.behindFrontWithTurn = function(object, start, end, refObject, enterLeaveTime){
		AnimationPalete.addTransitionToObject('behindFrontWithTurn', object, start, end, refObject, enterLeaveTime);	
	}
	
	AnimationPalete.frontBehind = function(object, start, end, refObject, enterLeaveTime){
		AnimationPalete.addTransitionToObject('frontBehind', object, start, end, refObject, enterLeaveTime);
	}
	*/
	AnimationPalete.addTransitionToObject = function(transitionName, object, start, end, refObject, enterLeaveTime){
		var aTiming = enterLeaveTime || getEnterLeaveTime(start, end)
		_setXandYOfObject(object, refObject)
		var enterTransition = allTransitions[transitionName].enter(object, refObject)
		var remainTransition =  allTransitions[transitionName].remain(object, refObject)
		var leaveTransition = allTransitions[transitionName].leave(object, refObject)
		
		enterTransition.set('from', aTiming.enterStart);
		enterTransition.set('to', aTiming.enterEnd);
		object.addTransition(enterTransition);
		if(aTiming.leaveStart){
			remainTransition.set('from', aTiming.enterEnd);
			remainTransition.set('to', aTiming.leaveStart);
			object.addTransition(remainTransition);
			
			leaveTransition.set('from', aTiming.leaveStart);
			leaveTransition.set('to', aTiming.leaveEnd);
			object.addTransition(leaveTransition);
		}else{
			remainTransition.set('from', aTiming.enterEnd);
			remainTransition.set('to', aTiming.leaveEnd);
			object.addTransition(remainTransition);
		}
	}
	
	var allTransitions = {
		'frontBehind' : {
			enter : function(object, refObject){
				var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 6, to : 1, ease : fabric.util.ease.easeInQuad}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 6, to : 1, ease : fabric.util.ease.easeInQuad}))
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 0, to : 1, ease : fabric.util.ease.easeInQuad}))
				return enterTransition;
			},
			remain : function(object, refObject){
				var remainTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 1, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 1}))
				return remainTransition;
			},
			leave : function(object, refObject){
				var leaveTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 0}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 0}))
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 1, to : 0}))
				return leaveTransition;
			}
		},
		'behindFrontWithTurn' : {
			enter : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 0, to : 1, ease : fabric.util.ease.easeInQuad}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 0, to : 1, ease : fabric.util.ease.easeInQuad}))
					.addPropertyTransition(new PropertyTransition({name : 'angle',  from : 0, to : 360, ease : fabric.util.ease.easeInQuad}))
				return enterTransition;
			},
			remain : function(object, refObject){
				var remainTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'angle',  from : 360, to : 360}))
				return remainTransition;
			},
			leave : function(object, refObject){
				var leaveTransition =  new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 6}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 6}))
					.addPropertyTransition(new PropertyTransition({name : 'angle',  from : 360, to : 0}))
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 1, to : 0}))
				return leaveTransition;
			}
		},
		'behindFront' : {
			enter : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 0, to : 1, ease : fabric.util.ease.easeInQuad}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 0, to : 1, ease : fabric.util.ease.easeInQuad}))
				return enterTransition;
			},
			remain : function(object, refObject){
				var remainTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 1}))
				return remainTransition;
			},
			leave : function(object, refObject){
				var leaveTransition =  new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 6}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 6}))
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 1, to : 0}))
				return leaveTransition;
			}
		},
		'topBottom' : {
			enter : function(object, refObject){
				var startTop = (object.top - (refObject.height/2 + (refObject.height/2)*.2))
				var endTop  = (object.top + ((refObject.height/2) + (refObject.height/2)*.2))
				var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : startTop, to : object.top, ease : fabric.util.ease.easeInQuad}))
				return enterTransition;
			},
			remain : function(object, refObject){
				var startTop = (object.top - (refObject.height/2 + (refObject.height/2)*.2))
				var endTop  = (object.top + ((refObject.height/2) + (refObject.height/2)*.2))
				var remainTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'top', from : object.top, to : object.top}))
				return remainTransition;
			},
			leave : function(object, refObject){
				var startTop = (object.top - (refObject.height/2 + (refObject.height/2)*.2))
				var endTop  = (object.top + ((refObject.height/2) + (refObject.height/2)*.2))
				var leaveTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'top', from : object.top, to : endTop}))
				return leaveTransition;
			}
		},
		'bottomTop' : {
			enter : function(object, refObject){
				var startTop = (object.top + (refObject.height/2 + (refObject.height/2)*.2))
				var endTop  = (object.top - ((refObject.height/2) + (refObject.height/2)*.2))
				var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : startTop, to : object.top, ease : fabric.util.ease.easeInQuad}))
				return enterTransition;
			},
			remain : function(object, refObject){
				var startTop = (object.top + (refObject.height/2 + (refObject.height/2)*.2))
				var endTop  = (object.top - ((refObject.height/2) + (refObject.height/2)*.2))
				var remainTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'top', from : object.top, to : object.top}))
				return remainTransition;
			},
			leave : function(object, refObject){
				var startTop = (object.top + (refObject.height/2 + (refObject.height/2)*.2))
				var endTop  = (object.top - ((refObject.height/2) + (refObject.height/2)*.2))
				var leaveTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'top', from : object.top, to : endTop}))
				return leaveTransition;
			}
		},
		'leftRight' : {
			enter : function(object, refObject){
				var startLeft = (object.left - (refObject.width/2 + (refObject.width/2)*.2))
				var endLeft  = (object.left + ((refObject.left/2) + (refObject.left/2)*.2))
				var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'left',  from : startLeft, to : object.left, ease : fabric.util.ease.easeInQuad}))
				return enterTransition;
			},
			remain : function(object, refObject){
				var startLeft = (object.left - (refObject.width/2 + (refObject.width/2)*.2))
				var endLeft  = (object.left + ((refObject.left/2) + (refObject.left/2)*.2))
				var remainTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'left', from : object.left, to : object.left}))
				return remainTransition;
			},
			leave : function(object, refObject){
				var startLeft = (object.left - (refObject.width/2 + (refObject.width/2)*.2))
				var endLeft  = (object.left + ((refObject.left/2) + (refObject.left/2)*.2))
				var leaveTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'left', from : object.left, to : endLeft}))
				return leaveTransition;
			}
		}
	}
	
	AnimationPalete.getAllTransitions = function(){
		return allTransitions;
	}
	
	AnimationPalete.getRandomTransition = function(){
		var transitionList = Object.keys(allTransitions);
		var index = Math.floor(Math.random() * transitionList.length);
		//console.log('random index is ' + index)
		return transitionList[index]
	}
	
	var getEnterLeaveTime = function(start, end){
		var eachWordDuration = end - start
		var enteringStartTime = start
		var eachWordEnterStartEndDt = parseInt(eachWordDuration * .2)
		var enteringEndTime = enteringStartTime + eachWordEnterStartEndDt
		var leavingStartTime = (start + eachWordDuration) -eachWordEnterStartEndDt
		var leavingEndTime = end
		return {
			enterStart : enteringStartTime,
			enterEnd : enteringEndTime,
			leaveStart : leavingStartTime,
			leaveEnd : leavingEndTime
		}
	}

	return AnimationPalete

});