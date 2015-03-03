
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Transition = require('./Transition');
	var PropertyTransition = require('./PropertyTransition');
	var AnimationPalete = {}
	
	AnimationPalete.topBottom = function(object, start, end, refObject){
		var aTiming = getEnterLeaveTime(start, end)
		var startTop = (refObject.top - (refObject.height/2 + (refObject.height/2)*.4))
		var endTop  = (refObject.top + ((refObject.height/2) + (refObject.height/2)*.4))
		object
			.addTransition( new Transition({from : aTiming.enterStart , to : aTiming.enterEnd})
					.addPropertyTransition(new PropertyTransition({name : 'top',  from : startTop, to : refObject.top})))
			.addTransition( new Transition({from : aTiming.enterEnd , to : aTiming.leaveStart})
					.addPropertyTransition(new PropertyTransition({name : 'top', from : refObject.top, to : refObject.top})))
			.addTransition( new Transition({from : aTiming.leaveStart , to : aTiming.leaveEnd})
					.addPropertyTransition(new PropertyTransition({name : 'top', from : refObject.top, to : endTop})))
	}
	
	AnimationPalete.behindFront = function(object, start, end, refObject){
		var aTiming = getEnterLeaveTime(start, end)
		var startTop = (refObject.top - (refObject.height/2 + (refObject.height/2)*.4))
		var endTop  = (refObject.top + ((refObject.height/2) + (refObject.height/2)*.4))
		object
			.addTransition( new Transition({from : aTiming.enterStart , to : aTiming.enterEnd})
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 0, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 0, to : 1})))
			.addTransition( new Transition({from : aTiming.enterEnd , to : aTiming.leaveEnd})
					.addPropertyTransition(new PropertyTransition({name : 'scaleX',  from : 1, to : 1}))
					.addPropertyTransition(new PropertyTransition({name : 'scaleY',  from : 1, to : 1})))
			
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