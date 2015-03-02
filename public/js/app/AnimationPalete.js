
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Transition = require('./Transition');
	var PropertyTransition = require('./PropertyTransition');
	var AnimationPalete = {}
	
	AnimationPalete.topBottom = function(text, start, end){
		var aTiming = getEnterLeaveTime(start, end)
		console.log('aTiming', aTiming)
		text
			.addTransition( new Transition({from : aTiming.enterStart , to : aTiming.enterEnd})
					.addPropertyTransition(new PropertyTransition({name : 'top', from : '-200', to : '250'}))
					.addPropertyTransition(new PropertyTransition({name : 'left', from : '0', to : '150'})))
			.addTransition( new Transition({from : aTiming.enterEnd , to : aTiming.leaveStart})
					.addPropertyTransition(new PropertyTransition({name : 'top', from : '250', to : '250'}))
					.addPropertyTransition(new PropertyTransition({name : 'left', from : '150', to : '150'})))
			.addTransition( new Transition({from : aTiming.leaveStart , to : aTiming.leaveEnd})
					.addPropertyTransition(new PropertyTransition({name : 'top', from : '250', to : '400'}))
					.addPropertyTransition(new PropertyTransition({name : 'left', from : '150', to : '150'})))
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