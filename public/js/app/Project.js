if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Previewer = require('app/Previewer')
	var Project = function(){
	}
	Project.prototype.save = function(params){
		$.ajax({
			url : '/project/',
			contentType: 'application/json', 
			data : JSON.stringify({
						fps: parseInt($('#fps').val()) , 
						quality : parseInt($("#quality").val()),
						resolutionFactor : $("#resolution").val() ,
						height : $("#resolution").val() == 1 ? 240 : 360 ,
						width : $("#resolution").val() == 1 ? 426 : 640,
						playLength : parseInt($('#playlength').val()), 
						projectName : params.projectName,
						fabricCanvas : Previewer.animatorToJSON(params.animator, params.canvas)}),
			type  : 'post',
			success : function(data){
				//alert('saved')
			}
		})
	}
	Project.prototype.update = function(params){
		$.ajax({
			url : '/project/' + params.id,
			contentType: 'application/json', 
			data : JSON.stringify({
						fps: parseInt($('#fps').val()) , 
						quality : parseInt($("#quality").val()),
						resolutionFactor : $("#resolution").val() ,
						height : $("#resolution").val() == 1 ? 240 : 360 ,
						width : $("#resolution").val() == 1 ? 426 : 640,
						playLength : parseInt($('#playlength').val()), 
						projectName : params.projectName,
						fabricCanvas : Previewer.animatorToJSON(params.animator, params.canvas)}),
			type  : 'put',
			success : function(data){
				//alert('saved')
			}
		})
	}
	
	Project['getAllProject'] = function(callBack){
		$.ajax({
			url : '/project/',
			contentType: 'application/json',
			type  : 'get',
			success : function(data){
				callBack(data)
			}
		})
	}
	
	Project['loadProject'] = function(id, callBack){
		$.ajax({
			url : '/project/'+id,
			contentType: 'application/json',
			type  : 'get',
			success : function(data){
				callBack(data)
			}
		})
	}
	
	return Project;
});