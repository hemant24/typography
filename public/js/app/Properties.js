if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Properties = function(params){
		console.log('initializing properites with value', params)
		if(!params){
			params = {}
		}
		this.top = params.top || 0;
		this.left = params.left || 0;
		this.fill = params.fill || "#FFFFFF";
		this.fontSize  = params.fontSize || 80;
		this.shadow = params.shadow || "rgba(0,0,0,1) 2px 2px 2px";
		this.fontFamily  =  params.fontFamily || "Times New Roman";
		this.angle = params.angle ||  0;
	}
	return Properties
})