if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('jquery')
	var WaveSurfer = require('wavesurfer');
	require('util');
	require('drawer');
	require('drawer.canvas');
	require('webaudio');
	require('wavesurfer.timeline');
	require('wavesurfer.regions');
	require('wavesurfer.frames.regions');
	var AnimateObjectView = require('app/view/AnimateObjectView');
	var Transition = require('./Transition');
	var PropertyTransition = require('./PropertyTransition');
	var TransitionItemView = require('app/view/TransitionItemView');
	var TransitionView = require('app/view/TransitionView');
	var AnimateObjectModel = require('./AnimateObjectModel');
	var AnimationPalete = require('./AnimationPalete');
	var Properties = require('app/Properties');
	var GroupAnimationPalete = require('./GroupAnimationPalete');
	var WordGroupUtil =  require('./WordGroupUtil');
	var ClipBoard = require('app/ClipBoard')
	var allFontFamily = ["Trebuchet MS", "Verdana", "Harry Potter", "DJB Just Don\'t Call Me Crazy", "TH3 MACHINE", "Billion Stars Personal Use ","DK Crayon Crumble", "Friday Night Lights"]
	var allFontSize = [100, 40, 80 ]
	var AudioTrack = function(file, animator){
		
		this.file = file;
		this.animator = animator;
		var transition = this.transition = new Transition({from : 100 , to : 200})
		var propertyTransition1 = new PropertyTransition({name : 'top', from : 100, to : 200})
		this.transition.get("propertyTransitions").add( propertyTransition1)
		//this.init.call(this);
	}
	
	AudioTrack.prototype.init = function(){
		console.log('init called with ' , this)
		this.wavesurfer = Object.create(WaveSurfer);
		this.wavesurfer.init({
			container: document.querySelector('#wave'),
			waveColor: 'violet',
			progressColor: 'purple',
			cursorWidth : 3,
			scrollParent : true,
			minPxPerSec : 100,
			height : 100
		});
		_bindEvents.call(this)
		//this.wavesurfer.load('assets/demo.mp3');
		this.wavesurfer.loadBlob(this.file);
	}
	AudioTrack.prototype.addFramesRegion = function(option){
		option.start = option.start;
		option.end = option.end ;
		return this.wavesurfer.addFramesRegion(option)
	}
	
	var _addTextButtonsToDialog = function(mainDiv, region){
		console.log('_addTextButtonsToDialog call with this', this)
		var audioTrack = this;
		var appendTo = mainDiv.find('#textButton');
		var paleteSection = mainDiv.find('#paleteSection')
		appendTo.children('.lyricsText').each(function(btn){
			this.remove();
		})
		
		paleteSection.find('input[type=radio][name=paleteType]').unbind('change').bind('change', function(){
			console.log($.trim(this.value))
			console.log($.trim(this.value) == 'wordGroup')
			if(this.value == 'wordGroup'){
				var wordGroup = []
				appendTo.children('.lyricsText').each(function(btn){
					wordGroup.push($(this).text());
					this.remove();
				})
				_addWordGroup.call(audioTrack, appendTo, wordGroup.join(" "), region);
			}else if(this.value == 'word'){
				var wordGroup = []
				appendTo.children('.lyricsText').each(function(btn){
					wordGroup.push($(this).text());
					this.remove();
				})
				var line = wordGroup.join(" ");
				var wordList = line.split(" ");
				_addWords.call(audioTrack, appendTo, wordList, wordList.length, region);
			}
			
		});
		
		
		var noOfWords = 4;
		var worldsToAdd = 0;
		var wordList = [];
		var lyrics = _getLyricsList();
		if($.trim(lyrics).length == 0){
			wordList = [];
		}else{
			wordList = lyrics.split(" ");
		}
		if(wordList.length && wordList.length >= noOfWords){
			worldsToAdd = noOfWords
		}else if(wordList.length){
			worldsToAdd = wordList.length
		}else{
			worldsToAdd = -1
		}
		_addWords.call(audioTrack, appendTo, wordList, worldsToAdd, region);
	}
	var _getLyricsList = function(){
		var lyrics = $.trim($("#lyrics").val());
		lyrics = lyrics.replace(/[ \t\r\n]+/g," ");
		return lyrics
	}
	var _addWordGroup = function(appendTo, line, region){
		var button = $('<button class="lyricsText">'+ line +'</button>')
		button.click(function(audioTrack){
					return function(){
						var startTime = parseInt(region.start*1000)
						var endTime = parseInt(region.end*1000)
						var eachWordDurationMapList = WordGroupUtil.eachWordDurationMapList(line, startTime, endTime);
						var previousObjectList = [];
						for(var i in eachWordDurationMapList){
							var wordDurationMap = eachWordDurationMapList[i];
								var text = audioTrack.addTextObjectToAnimator({
									text : wordDurationMap.word,
									startTime : wordDurationMap.start,
									endTime : endTime//wordDurationMap.end
								})
								audioTrack.setRandomFont.call(audioTrack, text);
								previousObjectList.push(text);
								GroupAnimationPalete.topBottom({
									object : text,
									previousObjectList : previousObjectList,
									startTime : wordDurationMap.start,
									endTime : wordDurationMap.end
								}, {
									camera : audioTrack.animator.getCamera()
								},{
									startTime : startTime,
									endTime : endTime, 
									totalObject : eachWordDurationMapList.length,
									currentObjectIndex : parseInt(i) + 1
								},{
									transition : {in : AnimationPalete.getRandomInTransition(),out : AnimationPalete.getRandomOutTransition()},
									audioTrack : audioTrack
								})
								
								_removeTextFromLyricsText(wordDurationMap.word);
								$(this).remove();
						}
					}
				}(this))
		appendTo.append(button)				
	}
	
	var _addWords = function(appendTo, wordList, wordsToAdd, region){
		for(var i=0 ; i < wordsToAdd ; i++){
				var text = wordList[i]
				var button = $('<button class="lyricsText">'+ text +'</button>')
				button.click(function(audioTrack){
					return function(){
						_addTextToAnimator.call(audioTrack, this, region)
					}
				}(this))
				appendTo.append(button)
			}
	}
	
	AudioTrack.prototype.setRandomFont = function(text){
		this.setProperFont.call(this, text, allFontSize[Math.floor(Math.random() * (allFontSize.length))])
		text.set('fontFamily', allFontFamily[Math.floor(Math.random() * (allFontFamily.length))])
	}
	
	AudioTrack.prototype.setProperFont = function(text, size){
		console.log('called set properfont')
		text.set('fontSize', size)
		var width = text.get('width');
		if(width >= 290){
			this.setProperFont.call(this, text, size - 1)
		}else{
			// do nothing
		}
	}
	
	AudioTrack.prototype.addImageObjectToAnimtor = function(params){
		fabric.util.loadImage('assets/img.png', function(oImg) {
			var object = new fabric.AImage(oImg, new Properties({left : this.animator.getCamera().get('left'), 
			top : this.animator.getCamera().get('top')}));
			object.scale(0.1);
			var startTime = params.startTime;
			var endTime = params.endTime;
			var frameRegion = this.addFramesRegion({
				start : startTime,
				end : endTime,
				color : "red",
				data : object
			})
			this.animator.add(object);
			object.get('animateObjectModel').set('region', frameRegion);
			AnimationPalete.addTransitionToObject({ in : 'InDown', out : 'fadeOutRight'}, object, startTime, endTime,  this.animator.getCamera());
		}.bind(this));
	}
	
	AudioTrack.prototype.addTextObjectToAnimator = function(params){
		var object = new fabric.AText(params.text, new Properties({left : this.animator.getCamera().get('left'), 
			top : this.animator.getCamera().get('top')}));;
		var startTime = params.startTime;
		var endTime = params.endTime;
		var frameRegion = this.addFramesRegion({
			start : startTime,
			end : endTime,
			color : "red",
			data : object
		})
		this.animator.add(object);
		object.get('animateObjectModel').set('region', frameRegion);
		return object;
	}
	
	AudioTrack.prototype.addCameraRegion = function(params){
		var object = params.camera;
		var startTime = params.startTime;
		var endTime = params.endTime;
		var frameRegion = this.addFramesRegion({
			start : startTime,
			end : endTime,
			color : "yellow",
			data : object
		})
		object.get('animateObjectModel').set('region', frameRegion);
		return object;
	}
	
	var _addTextToAnimator = function(button, region){
		var start = parseInt(region.start*1000)
		var end = parseInt(region.end*1000)
		var text = this.addTextObjectToAnimator({
			text : $(button).text(),
			startTime : start,
			endTime : end
		})		
		this.setRandomFont(text);
		AnimationPalete.addTransitionToObject({ in : AnimationPalete.getRandomInTransition(), out : AnimationPalete.getRandomOutTransition()}, text, start, end,  this.animator.getCamera());
		//AnimationPalete.behindFrontWithTurn(text, start, end, this.animator.getCamera())
		_removeTextFromLyricsText($(button).text());
		$(button).remove();
	}
	
	var _removeTextFromLyricsText = function(text){
		var lyrics = _getLyricsList();
		var wordList = lyrics.split(" ");
		wordList.splice(wordList.indexOf(text),1)
		$("#lyrics").val(wordList.join(' ' ))
	}
	
	var handleAddLyricsWord = function(mainDiv, region){
		var appendTo = mainDiv.find('#textButton');
		var lyrics = _getLyricsList();
		lyrics = lyrics.split(" ");
		var totalCurrentWords = mainDiv.find('.lyricsText').length
		var wordToAdd = lyrics[totalCurrentWords]
		if(wordToAdd){
			var wordList = [wordToAdd]
			var worldsToAdd = 1
			_addWords.call(this, appendTo, wordList, worldsToAdd, region);
		}
	}
	var handleRemoveLyricsWord = function(mainDiv, region){
		mainDiv.find('.lyricsText:last').remove()
	}
	var handleAddImage = function(mainDiv, region){
		var start = parseInt(region.start*1000)
		var end = parseInt(region.end*1000)
		this.addImageObjectToAnimtor({
			startTime : start,
			endTime : end
		})
	}
	
	var _bindEvents = function(){
		console.log('binding.................................')
		$(document).bind('copy', function(){
			var selectedRegion = null;
			for(var r in this.wavesurfer.regions.list){
				var inRegion = this.wavesurfer.regions.list[r]
				if($(inRegion.element).hasClass('selected')){
					selectedRegion = inRegion;
					break;
				}
			}
			console.log(' selectedRegion ' , selectedRegion)
			if(selectedRegion){
				var startTime = parseInt(selectedRegion.start * 1000) - 10;
				var endTime = parseInt(selectedRegion.end * 1000) + 10;
				var aObjects = []
				aObjects.push(selectedRegion)
				for(var i in this.animator._objs){
					var obj = this.animator._objs[i];
					var transitionList = obj.get('transitionList');			
					console.log('checking object of type ' + obj.get('type'))
					if(transitionList && transitionList.length && transitionList.length > 0){
						var firstTransition = transitionList[0];
						var lastTransition = transitionList[transitionList.length -1];
						console.log('transition from ' , firstTransition.get('from'))
						console.log('startTime ' , startTime)
						console.log('transition to ' , lastTransition.get('to'))
						console.log('endTime ' , endTime)
						console.log("firstTransition.get('from') >= startTime " , firstTransition.get('from') >= startTime)
						console.log("lastTransition.get('to') <= endTime " , lastTransition.get('to') <= endTime);
						if(firstTransition.get('from') >= startTime && lastTransition.get('to') <= endTime){
							aObjects.push(obj);
						}
					}
				}
				console.log('aObjects' , aObjects);
				if(aObjects && aObjects.length && aObjects.length > 0){
					ClipBoard.putData(aObjects);
				}
			}
		}.bind(this))
		/* Disabling paste functionality as its not fully developed yet.
		
		$(document).bind('paste', function(){
		
			function getCameraTransitionsMap(cameraTransitionIdList){
				var cameraTransitionList = []
				var camera = this.animator.getCamera();
				var cameraTransitions = camera.get('transitionList')
				for(var t in cameraTransitions){
					var ctId = cameraTransitions[t].get('transitionId')
					if(cameraTransitionIdList.indexOf(ctId) != -1 ){
						cameraTransitionList.push(cameraTransitions[t])
					}
				}
				console.log('return cameraTransitionList', cameraTransitionList);
				cameraTransitionList.sort(function(a,b){
					if(a.get('from') > b.get('from') ){
						return 1
					}else{
						return -1
					}
				})
				return cameraTransitionList
			}
			console.log('yes its pasting');
			var data = ClipBoard.getData();
			if(data && data.length){
				console.log('data is ' , data);
				var region = null
				for(var di in data){
					if(!data[di].type){
						region = data[di];
					}
				}
				console.log('region is ' , region);
				var cameraTransitionIdList = []
				var deltaInTime = 0;
				for(var d in data){
					if(data[d].type && data[d].type == 'aText'){
						var serializedData = JSON.stringify(data[d].toObject());
						console.log('serializedData ' , serializedData);
						var deSerialized = JSON.parse(serializedData)
						var aText = fabric.AText.fromObject(deSerialized);
						var transitionList = aText.get('transitionList');
						aText.set('transitionList', []);
						var transitionModelList = []
						if(aText.get('cameraTransitionId') != null){
							cameraTransitionIdList.push(aText.get('cameraTransitionId'))
						}
						var currentDuration = parseInt(this.wavesurfer.backend.getCurrentTime() * 1000);
						
						for(var i in transitionList){
							
							var transition = transitionList[i]
							if(i==0){
								var startOfFirstTransition = transition['from'];
								deltaInTime = currentDuration - startOfFirstTransition
							}
							var regionDelta = 0
							if(region){
								
								regionDelta = transition['from'] - parseInt(region['start'] * 1000)
								console.log('region Delta is ', regionDelta)
							}
							transition['from'] = transition['from'] + deltaInTime + regionDelta;
							transition['to'] = transition['to'] + deltaInTime + regionDelta;
							transitionModelList.push(new Transition(transition));
						}
						aText.set('transitionList', transitionModelList);
						aText.get('animateObjectModel').set('transitionList', transitionModelList);
						
						this.animator.add(aText);
						var firstTransition = transitionList[0]
						var lastTransition = transitionList[transitionList.length - 1]
						var startTime = firstTransition['from'];
						var endTime = lastTransition['to'];
						var frameRegion = this.addFramesRegion({
												start : startTime,
												end : endTime,
												color : "red",
												data : aText
											})
						aText.get('animateObjectModel').set('region', frameRegion);					
					}
				}
				console.log('cameraTransitionList  ' , cameraTransitionIdList);
				var cameraTransitionsToAdd = getCameraTransitionsMap.call(this, cameraTransitionIdList);
				for(var cti in cameraTransitionsToAdd){
					var cTrans = cameraTransitionsToAdd[cti]
					if(region){
						regionDelta = cTrans.get('from') - parseInt(region['start'] * 1000)
						console.log('region Delta is ', regionDelta)
					}
					var movementTransition =  new Transition({from : cTrans.get('from') + deltaInTime + regionDelta , to :  cTrans.get('to')+ deltaInTime + regionDelta})
					cTrans.get('propertyTransitions').each(function(propTrans){
						movementTransition.get('propertyTransitions').add(new PropertyTransition({name : propTrans.get('name') , from : propTrans.get('from'), to : propTrans.get('to')}))
					})
					console.log('new transtiion to add ', movementTransition);
					var camera = this.animator.getCamera();
					camera.addTransition(movementTransition);
				}
				console.log('now camera transition is '  , this.animator.getCamera().get('transitionList'))
					
			}
		}.bind(this))
		*/
		
		
		
		
		this.wavesurfer.on('region-click', function(region, e){
			console.log('wavesurfer', this.wavesurfer);
			for(var r in this.wavesurfer.regions.list){
				var inRegion = this.wavesurfer.regions.list[r]
				$(inRegion.element).removeClass('selected');
			}
			$(region.element).addClass('selected');
			/*
			var startTime = region.start * 1000;
			var endTime = region.end * 1000;
			var aObjects = []
			for(var i in this.animator._objs){
				var obj = this.animator._objs[i];
				var hasTransitions = obj.getKeyframeByTime(startTime);
				if(hasTransitions){
					aObjects.push(obj);
				}
			}
			console.log('aObjects' , aObjects);*/
		}.bind(this))
		
		this.wavesurfer.on('region-dblclick', function(region, e){
			var dialogOption = {}
			_addTextButtonsToDialog.call(this, $("#textSelection"), region)
			$("#textSelection").find('#addLyricsWord').unbind('click').bind('click', function(){
				handleAddLyricsWord.call(this, $("#textSelection"), region)
			}.bind(this))
			$("#textSelection").find('#removeLyricsWord').unbind('click').bind('click', function(){
				handleRemoveLyricsWord.call(this, $("#textSelection"), region)
			}.bind(this))
			$("#textSelection").find('#addImage').unbind('click').bind('click', function(){
				handleAddImage.call(this, $("#textSelection"), region)
			}.bind(this))
			
			$("#textSelection").dialog({
			buttons: [
				
				{
				  text: "Close",
				  click: function() {
					$( this ).dialog( "close" );
				  }
				},
				{
					text: "Play Region",
					click: function() {
						region.play();
					}
				},
				{
				  text: "Delete the Region",
				  class: "deleteRegion",
				  click: function() {
					$( this ).dialog( "close" );
					console.log(region);
					region.remove();
				  }
				}
			  ],
			  position: { my: "left+19 bottom", at: "left bottom", of: e },
			  show : true,
			  width : 600
			});
			console.log('region clicked', region, e)
		}.bind(this))
		this.wavesurfer.on('frames-region-click', function(region){
			//console.log('region clicked on ', region)
			this.animator.canvas.setActiveObject(region.data)
		}.bind(this))
		
		this.wavesurfer.on('frames-region-dblclick', function(region){
			//console.log('region double clicked on ', region)
			this.animator.canvas.setActiveObject(region.data)
			/*
			var transition = new Transition({from : 100 , to : 200})
			var propertyTransition1 = new PropertyTransition({name : 'top', from : 100, to : 200})
			transition.get("propertyTransitions").add( propertyTransition1)
			*/
			/*var animatedModel = new AnimateObjectModel({name : region.data.get("text"), fabricObject : region.data , region : region});
			_.each(region.data.get("transitionList"), function(t){
				//console.log('adding', t)
				animatedModel.get("transitionList").add(t)
			})*/
			var animatedModel = region.data.animateObjectModel
			console.log('b4 opening size ' + region.data.get('fontSize'))
			animatedModel.set('fontSize', region.data.get('fontSize'));
			console.log('b4 opening fontFamily ' + region.data.get('fontFamily'))
			animatedModel.set('fontFamily', region.data.get('fontFamily'));
			
			animatedModel.set('color', region.data.get('fill'));
			animatedModel.set('region', region)
			/*
			console.log('region data is ' , region.data.get("transitionList"))
			console.log('TransitionItemView', TransitionItemView)
			var transitionItemView = new TransitionItemView( {model : region.data.get("transitionList")[0]})
			transitionItemView.render()
			*/
			
			var transitionView = new TransitionView( {	model : animatedModel, 
														fabricObject : region.data, 
														animator : this.animator,
														audioTrack : this})
			//transitionView.render()
			/*var animateObjectView = new AnimateObjectView( {model : animatedModel, fabricObject : region.data})
			animateObjectView.render()*/
			
			$("#dialog").dialog({
				show : true,
				width: 700,
				close : function(){
					transitionView.remove()
				}
			})
			/*
			$("#dialog").dialog({
				show : true,
				close : function(){
					transitionView.remove()
				}
			})*/
			/*
			var animateObjectView = new AnimateObjectView(region.data)
			animateObjectView.render();
		
			$("#dialog").dialog({
				show : true,
				close : function(){
					animateObjectView.remove()
				}
			})*/
		}.bind(this))
		
		this.wavesurfer.on('frames-region-update-end', function(region, direction){
			console.log('region udpated with direction' +  direction)
			_updateAnimateFrames.call(this, region, direction)
		}.bind(this))
		
		
		this.wavesurfer.on('ready', function () {
			//wavesurfer.play();
			this.animator.playLength = this.wavesurfer.getDuration() *1000
			var timeline = Object.create(WaveSurfer.Timeline);
			timeline.init({
				wavesurfer: this.wavesurfer,
				container: "#wave-timeline"
			});
			
			timeline.on('click', function(percentage){
				this.wavesurfer.seekTo(percentage);
			})
		}.bind(this));
		
		this.wavesurfer.drawer.on('click', function(e, progress){
			var duration = this.wavesurfer.getDuration();
			var elapsedTime = progress * duration * 1000;
			//first clear all rendered object 
			
			var currentRenderedObject = this.animator.canvas.getObjects();
			for(var i = 0 ; i < currentRenderedObject.length ; i++){
				var obj = currentRenderedObject[i];
				console.log(obj)
				if(obj.get('type') == 'aText'){
					console.log('removing it ....');
					this.animator.canvas.remove(obj);
					this.animator.canvas.renderAll();
				}				
			}
			//this.animator.canvas.renderAll();
			
			this.animator.seek(elapsedTime);
		}.bind(this))
		
		this.wavesurfer.enableDragSelection({
			color: randomColor(0.5)
		});
		this.wavesurfer.backend.on('audioprocess', _progressAnimation.bind(this));
		
		$("#playPause").click(function(){
			this.wavesurfer.backend.un('audioprocess');
			this.wavesurfer.backend.on('audioprocess', _progressAnimation.bind(this));
			this.wavesurfer.playPause()
		}.bind(this))
	}
	
	var _updateAnimateFrames = function(region, direction){
		//console.log('on region change' , region)
		var animateObject = region.data;
		var associatedCamera = animateObject.get('camerTransitions');
		if(animateObject.transitionList && animateObject.transitionList.length && animateObject.get('type')!= 'aCamera'){
			var firstKeyframe = animateObject.transitionList[0]
			var lastKeyframe = animateObject.transitionList[animateObject.transitionList.length - 1]
			var firstKeyframeStartAt = firstKeyframe.get('from')
			var lastKeyframeEndAt = lastKeyframe.get('to')
			
			var regionStartAt = parseInt(region.start)
			var regionEndAt = parseInt(region.end)
			
			
			var newDuration = regionEndAt -regionStartAt
			var oldDuration = lastKeyframeEndAt - firstKeyframeStartAt
			if(associatedCamera){
				var transitionDuration = parseInt(associatedCamera.get('to')) - parseInt(associatedCamera.get('from'))
				console.log('transitionDuration', transitionDuration);
				console.log('going to change to and from of associatedCamera')
				console.log('associatedCamera ', associatedCamera)
				associatedCamera.set('from', regionStartAt)
				associatedCamera.set('to', regionStartAt+transitionDuration)
				console.log('end change to and from of associatedCamera')
			}
			var action = ""
			console.log('oldduration '+ oldDuration)
			console.log('newduration '+ newDuration)
			if(newDuration != oldDuration){
				var perChange = parseInt(((newDuration - oldDuration)/oldDuration)*100)  // parseInt(((regionEndAt - lastKeyframeEndAt)/lastKeyframeEndAt)*100)
				_strechOrSequezeDurationToAllKeyframes.call(this, perChange, animateObject.transitionList, region, direction)
			}
			if(newDuration == oldDuration && regionStartAt !=  firstKeyframeStartAt){
				_addDurationToAllKeyframes.call(this, (regionStartAt - firstKeyframeStartAt), animateObject.transitionList);
			}
		}
	}
	
	var _strechOrSequezeDurationToAllKeyframes = function(perChange, transitionList, region, direction){
		console.log('it was sequeze or strech , percentage chagne ' +region.end)
		console.log('with direct ' + direction)
		var startTime = 0
		var endTime = 0
		if(direction == 'end'){
			for(var i in transitionList){
				var keyframe = transitionList[i];
				if(i == 0){
					//console.log('it is first frame')
					//console.log('keyframe start time' + keyframe.startAt)
					//console.log('region start time' + region.start)
					startTime = region.start
				}
				
				if(i != 0){
					//console.log('setting startAt value for other than first')
					
					var delta = ((parseFloat(keyframe.get('from')) - startTime) * perChange)/100
					//console.log('change in value ' + delta)
					//keyframe.set('from', parseInt(parseFloat(keyframe.get('from')) + delta))
				}
				if(i != (transitionList.length - 1)){
					//console.log('setting endAt value for other last ')
					var delta2 = (( parseFloat(keyframe.get('to')) - startTime)* perChange )/100
					//console.log('befor change' + keyframe.endAt)
					//console.log('change in value ' + delta2)
					keyframe.set('to', parseInt(parseFloat(keyframe.get('to') + delta2)))
					//console.log('after change' + keyframe.endAt)
				}else{
					//console.log('setting endAt value for last ')
					console.log('setting value for last keyframe' + region.end)
					keyframe.set('to', parseInt(region.end))
				}
				
			}
		}else{
			console.log('region start with' +region.start)
			console.log('inside with start' , transitionList.length-1)
			for(var i = transitionList.length-1; i>=0 ; i=i-1){
				var keyframe = transitionList[i];
				if(i==(transitionList.length-1)){
					
					endTime = transitionList[transitionList.length - 1].get('to')
					console.log('endTime is ' , endTime)
				}
				if(i == 0){
					keyframe.set('from', region.start)
				}else{
					var delta = (( parseFloat(endTime - keyframe.get('from')))* perChange )/100;
					keyframe.set('from', parseInt(parseFloat(keyframe.get('from') - delta)))
				}
				
			}
		}
	}
	var _addDurationToAllKeyframes = function(duration, transitionList){
		//console.log('it was a move')
		for(var i in transitionList){
			var keyframe = transitionList[i]
			//console.log('befor keyframe startAt ' + keyframe.get('from'))
			//console.log('befor keyframe endAt ' + keyframe.get('to'))
			if(i == 0){
				keyframe.set('from', parseFloat(keyframe.get('from')) + duration)
			}
			keyframe.set('to',   parseFloat(keyframe.get('to')) + duration)
			//console.log('after keyframe startAt ' + keyframe.get('from'))
			//console.log('after keyframe endAt ' + keyframe.get('to'))
		}
	}
	
	var _progressAnimation = function(time){
		//console.log('current time '+ (time*1000))
		this.animator.seek(time*1000);
	}
	
	/*
	var wavesurfer = Object.create(WaveSurfer);
	wavesurfer.on('frames-region-click', function(){
		new AnimateObjectView()
		
		$("#dialog").dialog({
			show : true
		})
	})
	wavesurfer.init({
		container: document.querySelector('#wave'),
		waveColor: 'violet',
		progressColor: 'purple',
		cursorWidth : 3,
		scrollParent : true,
		minPxPerSec : 100
	});

		wavesurfer.on('ready', function () {
			//wavesurfer.play();
			var timeline = Object.create(WaveSurfer.Timeline);
			
			timeline.init({
				wavesurfer: wavesurfer,
				container: "#wave-timeline"
			});
			
			timeline.on('click', function(percentage){
				wavesurfer.seekTo(percentage);
			})
			console.log(wavesurfer.addRegion({start : 2 , end : 4, color :  randomColor(0.1)}))
			console.log(wavesurfer.addFramesRegion({start : 1500/1000 , end : 1600/1000, color :  "red"}))
			console.log(wavesurfer.addFramesRegion({start : 1800/1000 , end : 2000/1000, color :  "red"}))
		});
		
		wavesurfer.drawer.on('click', function(e, progress){
			console.log('click', e, progress)
		
		})
		
		
		
		wavesurfer.enableDragSelection({
			color: randomColor(0.1)
		});
		
		
		wavesurfer.load('assets/demo.mp3');
		
		
		$("#playPause").click(function(){
			wavesurfer.playPause()
		})
		*/
		function randomColor(alpha) {
			return 'rgba(' + [
				~~(Math.random() * 255),
				~~(Math.random() * 255),
				~~(Math.random() * 255),
				alpha || 1
			] + ')';

		}
		return AudioTrack
});