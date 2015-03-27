
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
	AnimationPalete.addTransitionToObject = function(transitions, object, start, end, refObject, enterLeaveTime){
		console.log('transitions >>>> ' , transitions);
		var aTiming = enterLeaveTime || getEnterLeaveTime(start, end)
		_setXandYOfObject(object, refObject)
		var enterTransition = enterTransitions[transitions.in](object, refObject)//allTransitions[transitionName].enter(object, refObject)
		var remainTransition =  new Transition();//allTransitions[transitionName].remain(object, refObject)
		var leaveTransition = leaveTransitions[transitions.out](object, refObject)//allTransitions[transitionName].leave(object, refObject)
		
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
	
	var enterTransitions = {
		'BounceIn' : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 0, to : 1, easeFn : 'easeOutBounce'}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 0, to : 1, easeFn : 'easeOutBounce'}))
				return enterTransition;
			},
		'ZoomInDown' :  function(object, refObject){
					var startTop = (object.top - (refObject.height/2 + (refObject.height/2)*.2))
					var endTop  = (object.top + ((refObject.height/2) + (refObject.height/2)*.2))
					var enterTransition = new Transition()
						.addPropertyTransition(new PropertyTransition({name : 'top',  from : startTop, to : object.top}))
						.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 0, to : 1}))
						.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 0, to : 1}))
					return enterTransition;
				},
		'FadeInDown' :  function(object, refObject){
				var startTop = (object.top - (refObject.height/2 + (refObject.height/2)*.2))
				var endTop  = (object.top + ((refObject.height/2) + (refObject.height/2)*.2))
				var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : startTop, to : object.top}))
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 0, to : 1}))
				return enterTransition;
			},
		'InDown' :  function(object, refObject){
				var startTop = (object.top - (refObject.height/2 + (refObject.height/2)*.2))
				var endTop  = (object.top + ((refObject.height/2) + (refObject.height/2)*.2))
				var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : startTop, to : object.top}))
				return enterTransition;
			},
		'ZoomInBehind' : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 0, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 0, to : 1}))
				return enterTransition;
			},
		'fadeZoomInFront' : function(object, refObject){
				var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 6, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 6, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 0, to : 1}))
				return enterTransition;
			},
		'ZoomInBehindTurn' : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 0, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 0, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'angle',  from : 0, to : 360}))
				return enterTransition;
			},
		'fadeZoomInFrontTurn' : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 0, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 6, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 6, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'angle',  from : 0, to : 360}))
				return enterTransition;
			}
	}
	var leaveTransitions = {
		'ZoomOutBehind' : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 0}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 0}))
				return enterTransition;
			},
		'fadeZoomOutFront' : function(object, refObject){
				var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 6}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 6}))
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 1, to : 0}))
				return enterTransition;
			},
		'ZoomOutBehindTurn' : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 0}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 0}))
					.addPropertyTransition(new PropertyTransition({name : 'angle',  from : 360, to : 0}))
				return enterTransition;
			},
		'fadeZoomOutFrontTurn' : function(object, refObject){
				 var enterTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 1, to : 0}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 6}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 6}))
					.addPropertyTransition(new PropertyTransition({name : 'angle',  from : 360, to : 0}))
				return enterTransition;
			},
	}
	
	var allTransitions = {
		/*
		'frontBehind' : {
			enter : function(object, refObject){
				return enterTransitions['fadeZoomInFront'](object, refObject)
			},
			remain : function(object, refObject){
				var remainTransition = new Transition()
					.addPropertyTransition(new PropertyTransition({name : 'opacity',  from : 1, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 1}))
				return remainTransition;
			},
			leave : function(object, refObject){
				return leaveTransitions['ZoomOutBehind'](object, refObject)
			}
		},*/
		'behindFrontWithTurn' : {
			enter : function(object, refObject){
				return enterTransitions['ZoomInBehindTurn'](object, refObject)
			},
			remain : function(object, refObject){
				var remainTransition = new Transition()
					//.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 1}))
					//.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 1}))
					//.addPropertyTransition(new PropertyTransition({name : 'angle',  from : 360, to : 360}))
				return remainTransition;
			},
			leave : function(object, refObject){
				return leaveTransitions['ZoomOutBehind'](object, refObject)
			}
		}/*,
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
		}*/
	}
	
	AnimationPalete.getAllTransitions = function(){
		var transitions = {}
		for(var key in enterTransitions){
			transitions[key] = enterTransitions[key]
		}
		for(var key in leaveTransitions){
			transitions[key] = leaveTransitions[key]
		}
		return transitions;
	}
	AnimationPalete.getRandomInTransition = function(){
		var transitionList = Object.keys(enterTransitions);
		var index = Math.floor(Math.random() * transitionList.length);
		//console.log('random index is ' + index)
		return transitionList[index]
	}
	
	AnimationPalete.getRandomOutTransition = function(){
		var transitionList = Object.keys(leaveTransitions);
		var index = Math.floor(Math.random() * transitionList.length);
		//console.log('random index is ' + index)
		return transitionList[index]
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