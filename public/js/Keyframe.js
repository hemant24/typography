var motionText = motionText || {};

(function(global){

	var Keyframe = function(startAt, endAt, properties, easing){
		this.startAt = startAt || 0;
		this.endAt = endAt || 0;
		this.properties = properties || {};
		this.easing = easing || '';
		this.running = false;
	}
	
	motionText.Keyframe = Keyframe;
})(window)