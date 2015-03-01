var motionText = motionText || {};

(function(global){

	var Stage = function(){
		this._obj = []
	}
	Stage.prototype.add = function(obj){
		this._obj.push(obj)
	}
	
	motionText.Stage = Stage;
})(window)