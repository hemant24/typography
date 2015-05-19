define(function(require) {
		require('jquery')
		require('jquery.layout')
		require('jquery.ui.all')
		require('jquery.layout.resizePaneAccordions')
		require('app/AObjects')
		require('app/ClipBoard')
		//require('socket.io')
		require('backbone')
		require('app/view/TransitionItemView');
		require('jquery.fileupload');
		//var io = require('socket.io')
		
		//var video = io.connect('http://localhost:3000/video')
		
		var AudioTrack = require('app/Audio')
		var Properties = require('app/Properties')
		var SrtObjectGenerator = require('app/SrtObjectGenerator')
		
		var AnimateObjectView = require('app/view/AnimateObjectView')
		
        var fabric = require('fabric')
		var Animator = require('app/Animator')
		var DrawingArea = require('app/DrawingArea')
		var Previewer = require('app/Previewer')
		var Project = require('app/Project')
		
		var Transition = require('./Transition');
		var PropertyTransition = require('./PropertyTransition');
		//var TransitionView = require('app/view/TransitionView');
		var allCanvasColor = ['#9600BF', '#FF0000', '#00B524', '#1D02CC']
		var canvasColor = allCanvasColor[Math.floor(Math.random() * (allCanvasColor.length))]
		var gridAndCameraColor = "#000000"
		
		$("#add").click(function(){
			
		})
		
	
		/*
		video.on('welcome', function(msg){
			console.log('server is welcoming')
		});*/
		
		
		
		

		myLayout = $('body').layout({
			west__size:			260
		,	east__size:			320
		,   south__size : 150
			// RESIZE Accordion widget when panes resize
		,	west__onresize:		$.layout.callbacks.resizePaneAccordions
		,	east__onresize:		$.layout.callbacks.resizePaneAccordions

		});

		// ACCORDION - in the West pane
		$("#accordion1").accordion({
			heightStyle: "content",
			collapsible : true
		});
		
			
		
		// ACCORDION - in the East pane - in a 'content-div'
		$("#accordion2").accordion({

		});

		
		var canvas = new fabric.Canvas('cc');
		//canvas.setBackgroundColor('#000000');
		canvas.setBackgroundColor(canvasColor);
		$("#canvasBackground").val(canvasColor);
		$("#canvasBackground").bind('keyup', function(){
			canvas.setBackgroundColor($(this).val());
			canvas.renderAll();
		})
		//canvas.selectionColor  = 'black';
		//canvas.selectionBorderColor = 'black';
		//canvas.selectionLineWidth = 5;
		var animator = new Animator(canvas,'drawing', 3000);
		var drawingArea = new DrawingArea(canvas, "#drawingArea")
		var audioTrack = new AudioTrack('to_add', animator)
		var transition1 = new Transition({from : 100 , to : 400})
							.addPropertyTransition(new PropertyTransition({name : 'top', from : '-200', to : '100'}))
							.addPropertyTransition(new PropertyTransition({name : 'left', from : '0', to : '100'}))
		var transition2 = new Transition({from : 500 , to : 800})
							.addPropertyTransition(new PropertyTransition({name : 'angle', from : '90', to : '0'}))
		var transitions = []
		transitions.push(transition1)
		transitions.push(transition2)
	
		var aText = new fabric.AText("Hemant",new Properties({angle : 90}))
		//animator.add(aText)
		aText.addTransitions(transitions)
		//animator.play()
		//console.log(aText.getKeyframeByTime2(200))
		
	

		$('#fileupload').fileupload({
			dataType: 'json',
			add : function(e, data){
				audioTrack.fileDataContext = data;
				audioTrack.file = data.files[0];
				audioTrack.init();
				audioTrack.wavesurfer.on('ready', function(){
					console.log('total duration is ' + parseInt(audioTrack.wavesurfer.getDuration() * 1000));
				})
				
			},
			done: function (e, data) {
			}
		});		
		$("#saveProject").click(function(){
			var project = new Project();
			console.log('going to save', project);
			var projectId = $("#loadedProjectId").val()
			var params = {animator : animator, 
							canvas : canvas,
							projectName : $("#projectName").val()}
			if(projectId && $.trim(projectId).length > 0){
				params.id = projectId
				project.update(params);
			}else{
				project.save(params);
			}
			

		})
		
		$("#loadProject").click(function(){
			var projectId = $("#projectList option:selected").val()
			var projectName = $("#projectList option:selected").text()
			
			Project.loadProject(projectId, function(project){
				$("#loadedProjectId").val(projectId);
				
				var oldObjects = []
				canvas.getObjects().map(function(instance){
					oldObjects.push(instance);
				});
				var oldObjectsLength = oldObjects.length 
				for(var i = 0 ; i < oldObjectsLength; i++){
					var instance = oldObjects[i];
					canvas.remove(instance);
				}
				
				animator._objs = [];
				animator._objs.length = 0;
			
				var project = project.project;
				$("#projectName").val(project.projectName);
				$("#saveProject").val('Update Project');
				//console.log('project to load is ' , project);
				
				canvas.loadFromJSON(project.fabricCanvas, function(){
					var objectCameraTransitionMap = {}
					var cameraObject = null
					for(var i in animator._objs){
						var objectToRemove = animator._objs[i];
						console.log('objectToRemove', objectToRemove);
						if(objectToRemove.get('type') != 'aCamera'){
							canvas.remove(objectToRemove);
							var transitionList = objectToRemove.get('transitionList');
							objectToRemove.set('transitionList', []);
							if(objectToRemove.get('cameraTransitionId') != null){
								objectCameraTransitionMap[objectToRemove.get('cameraTransitionId')] = objectToRemove
							}
							for(var t in transitionList){
								var transition = transitionList[t];
								//console.log('before transition', transition)
								var trans = new Transition(transition)
								objectToRemove.get('transitionList').push(trans);
								objectToRemove.get('animateObjectModel').get("transitionList").add(trans)
								//console.log('now objecttoremove', objectToRemove);
							}
							transitionList = objectToRemove.get('transitionList');
							var firstTransition = transitionList[0]
							console.log('firstTransition ', firstTransition)
							var lastTransition = transitionList[transitionList.length - 1]
							var startTime = firstTransition.get('from');
							var endTime = lastTransition.get('to');
							console.log('add region')
							console.log('startTime '  + startTime)
							console.log('endTime '  + endTime)
							var frameRegion = audioTrack.addFramesRegion({
											start : startTime,
											end : endTime,
											color : "red",
											data : objectToRemove
										})
							
							//console.log(" objectToRemove.get('animateObjectModel') " , objectToRemove.get('animateObjectModel'));
							objectToRemove.get('animateObjectModel').set('region', frameRegion);
							console.log(objectToRemove);
						}else{
							cameraObject = objectToRemove;

						}
					}
					if(cameraObject){
						var transitionList = cameraObject.get('transitionList');
						cameraObject.set('transitionList', []);
						for(var t in transitionList){
							var transition = transitionList[t];
							//console.log('before transition', transition)
							var trans = new Transition(transition)
							cameraObject.get('transitionList').push(trans);
							cameraObject.get('animateObjectModel').get("transitionList").add(trans)
							console.log("trans.get('transitionId')", trans.get('transitionId'))
							console.log("objectCameraTransitionMap[trans.get('transitionId')] " , objectCameraTransitionMap[trans.get('transitionId')])
							if(objectCameraTransitionMap[trans.get('transitionId')]){
								var obj = objectCameraTransitionMap[trans.get('transitionId')]
								obj.set('camerTransitions', trans);
							}
							//console.log('now objecttoremove', objectToRemove);
						}
						animator.initializeCamera(cameraObject);
					}
					console.log('objectCameraTransitionMap', objectCameraTransitionMap);
					animator.addGridLines(gridAndCameraColor);
				}, function(o, object){
					animator.add(object)
					//console.log('removed :' , previewCanvas.remove(object))
				} )
				
			})
		})
		
					
		Project.getAllProject(function(projectList){
			console.log('got all projects ' , projectList)
			for(var i in projectList.projects){
				var proj = projectList.projects[i]
				$('<option>').val(proj['_id']).text(proj['projectName']).appendTo('#projectList');
			}
		});
		
		$("#createVideo").click(function(){
			console.log('current fps is ' , parseInt($('#fps').val()))
			var background = {
				type : 'color'
			}
			if($("#backgroundImage").is(':checked')){
				background['type'] = 'image'
			}
			console.log('$("#resolution").val()' , $("#resolution").val());
			
			$.ajax({
				url : '/video/',
				contentType: 'application/json', 
				data : JSON.stringify({
							fps: parseInt($('#fps').val()) , 
							quality : parseFloat($("#quality").val()),
							resolutionFactor : $("#resolution").val() ,
							height : $("#resolution").val() == 1 ? 240 : 360 ,
							width : $("#resolution").val() == 1 ? 426 : 640,
							playLength : parseInt($('#playlength').val()), 
							background : background,
							fabricCanvas : Previewer.animatorToJSON(animator, canvas, background)}),
				type  : 'post',
				success : function(data){
					$("#videoLink").attr('href', 'output/' + data.url + '/' + data.filename)
					console.log(audioTrack.fileDataContext)
					audioTrack.fileDataContext.url = 'upload/uploads/?dir=' + data.url;
					audioTrack.fileDataContext.submit()
				}
			})
			
		})
		
				
		//var aText = new fabric.AText("Hemant",new Properties())
		//animator.add(aText)
		/*
		var aText = new fabric.AText(
			"Hemant", new Properties()).keyframe(100, 400, new Properties({top : '-200'}), new Properties({top : '100'}),fabric.util.ease.easeOutBounce)
		//.keyframe(500, 800, {angle : {from : '90', to : '0'}},fabric.util.ease.easeOutBounce)
		//.keyframe(1600,3000, { fontSize : {from : 80 , to :  '800'},opacity : {from : 1, to :0}, top: {from : 180, to : 500}, left: { from : 200, to : -500}}, fabric.util.ease.easeOutBounce)
		
		animator.add(aText)
		//aText.saveToStartState();
		aText.on('selected' , function(){
			console.log(this)
		})
animator.play()*/
			
		var camera = new fabric.ACamera({
		  top: 200,
		  left : 300,
		  fill: null,
		  stroke: gridAndCameraColor,
		  strokeWidth: 3,
		  perPixelTargetFind  : true
		})
		canvas.add(camera)
		animator.add(camera)
		animator.initializeCamera(camera)
		animator.addGridLines(gridAndCameraColor);
		
		$("#seekBtn").click(function(){
			console.log("seeking to " ,  $("#seekTime").val())
			animator.seek( $("#seekTime").val())
			
		})
		
		$("#add").click(function(){
			audioTrack.addFramesRegion({
					start : 100,
					end : 800,
					color : "red",
					data : aText
				})
		})
		
		$("#preview").click(function(){
			//console.log('going to call previwer')
			//console.log(JSON.stringify(Previewer.animatorToJSON(animator, canvas)))
			//console.log(JSON.stringify(Previewer.canvasToJSON(canvas)))
			Previewer.preview(JSON.stringify(Previewer.animatorToJSON(animator, canvas)), 15000 ,1, 1, function(animator){
				//audioTrack.wavesurfer.stop();
				audioTrack.wavesurfer.playPause();
				audioTrack.wavesurfer.backend.un('audioprocess');
				audioTrack.wavesurfer.backend.on('audioprocess', function(time){
					animator.seek(time*1000);
				});
				
			})//animator.playLength)
		})
		
		$("#generate").click(function(){ 
			new SrtObjectGenerator({audioTrack : audioTrack}).generate();
			//console.log(srtParser.fromSrt($("#lyrics").val(), true))
			/*
			var lyrics = $("#lyrics").val();
			$("#lyrics").val('')
			lyrics = lyrics.replace(/[ \t\r\n]+/g," ");
			var wordList = lyrics.split(" ");
			
			var playLength = parseInt(animator.playLength)
			console.log('playlength', playLength)
			var eachWordDuration = parseInt(playLength/wordList.length)
			var eachWordEnterStartEndDt = parseInt(eachWordDuration * .2)
			console.log('eachWordDuration', eachWordDuration)
			console.log('eachWordEnterStartEndDt', eachWordEnterStartEndDt)
			var timeElapsed = 0
			for(var idx in wordList){
				var word = wordList[idx]
				var text = new fabric.AText(word, new Properties())
				text.on('selected' , function(){
					console.log(this)
				})
				
				var enteringStartTime = timeElapsed
				var enteringEndTime = timeElapsed+eachWordEnterStartEndDt
				var leavingStartTime = timeElapsed + (eachWordDuration-eachWordEnterStartEndDt)
				var leavingEndTime = timeElapsed+eachWordDuration
				
				animator.add(text
					.addTransition( new Transition({from : enteringStartTime , to : enteringEndTime})
							.addPropertyTransition(new PropertyTransition({name : 'top', from : '-200', to : '250'}))
							.addPropertyTransition(new PropertyTransition({name : 'left', from : '0', to : '150'})))
					.addTransition( new Transition({from : enteringEndTime , to : leavingStartTime})
							.addPropertyTransition(new PropertyTransition({name : 'top', from : '250', to : '250'}))
							.addPropertyTransition(new PropertyTransition({name : 'left', from : '150', to : '150'})))
					.addTransition( new Transition({from : leavingStartTime , to : leavingEndTime})
							.addPropertyTransition(new PropertyTransition({name : 'top', from : '250', to : '400'}))
							.addPropertyTransition(new PropertyTransition({name : 'left', from : '150', to : '150'})))
				)
				timeElapsed = timeElapsed + eachWordDuration;
				audioTrack.addFramesRegion({
					start : enteringStartTime,
					end : leavingEndTime,
					color : "red",
					data : text
				})
			}
			
		*/
		})
			/*
		  new $.Zebra_Accordion('#accordion', {
				'collapsible':  true
			});
	*/

        
    }
);


