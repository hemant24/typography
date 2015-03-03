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
	var Properties = require('app/Properties')
	
	var AudioTrack = function(file, animator){
		
		this.file = file;
		this.animator = animator;
		var transition = this.transition = new Transition({from : 100 , to : 200})
		var propertyTransition1 = new PropertyTransition({name : 'top', from : 100, to : 200})
		this.transition.get("propertyTransitions").add( propertyTransition1)
		this.init.call(this);
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
		this.wavesurfer.load('assets/demo.mp3');
		//this.wavesurfer.loadBlob(this.file);
	}
	AudioTrack.prototype.addFramesRegion = function(option){
		option.start = option.start;
		option.end = option.end ;
		return this.wavesurfer.addFramesRegion(option)
	}
	
	var _addTextButtonsToDialog = function(appendTo, region){
		console.log('_addTextButtonsToDialog call with this', this)
		appendTo.children('.lyricsText').each(function(btn){
			this.remove();
		})
		var noOfWords = 4;
		var worldsToAdd = 0;
		var wordList = [];
		var lyrics = $.trim($("#lyrics").val());
		lyrics = lyrics.replace(/[ \t\r\n]+/g," ");
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
		for(var i=0 ; i < worldsToAdd ; i++){
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
	
	var _addTextToAnimator = function(button, region){
		var text = new fabric.AText($(button).text(), new Properties({left : this.animator.getCamera().get('left'), 
			top : this.animator.getCamera().get('top')}));
		
		var start = parseInt(region.start*1000)
		var end = parseInt(region.end*1000)
		console.log('camera is' + this.animator.getCamera())
		AnimationPalete.topBottom(text, start, end, this.animator.getCamera())
		var frameRegion = this.addFramesRegion({
					start : start,
					end : end,
					color : "red",
					data : text
				})
		this.animator.add(text)
		console.log('animatedObject Model is ' , text.get('animateObjectModel'))
		console.log('frameRegion', frameRegion)
		text.get('animateObjectModel').set('region', frameRegion);
			console.log('animatedObject Model is ' , text.get('animateObjectModel'))
		console.log('after adding palete', text)
		var lyrics = $.trim($("#lyrics").val());
		lyrics = lyrics.replace(/[ \t\r\n]+/g," ");
		var wordList = lyrics.split(" ");
		wordList.splice(wordList.indexOf($(button).text()),1)
		$("#lyrics").val(wordList.join(' ' ))
		$(button).remove();
				
	}
	
	var _bindEvents = function(){
		this.wavesurfer.on('region-dblclick', function(region, e){
			var dialogOption = {}
			_addTextButtonsToDialog.call(this, $("#textSelection"), region)
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
			  width : 450
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
			animatedModel.set('region', region)
			/*
			console.log('region data is ' , region.data.get("transitionList"))
			console.log('TransitionItemView', TransitionItemView)
			var transitionItemView = new TransitionItemView( {model : region.data.get("transitionList")[0]})
			transitionItemView.render()
			*/
			
			var transitionView = new TransitionView( {model : animatedModel, fabricObject : region.data})
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
			var elapsedTime = progress * duration * 1000
			this.animator.seek(elapsedTime);
		}.bind(this))
		
		this.wavesurfer.enableDragSelection({
			color: randomColor(0.5)
		});
		this.wavesurfer.backend.on('audioprocess', _progressAnimation.bind(this));
		
		$("#playPause").click(function(){
			this.wavesurfer.playPause()
		}.bind(this))
	}
	
	var _updateAnimateFrames = function(region, direction){
		//console.log('on region change' , region)
		var animateObject = region.data;
		if(animateObject.transitionList && animateObject.transitionList.length){
			var firstKeyframe = animateObject.transitionList[0]
			var lastKeyframe = animateObject.transitionList[animateObject.transitionList.length - 1]
			var firstKeyframeStartAt = firstKeyframe.get('from')
			var lastKeyframeEndAt = lastKeyframe.get('to')
			
			var regionStartAt = parseInt(region.start)
			var regionEndAt = parseInt(region.end)
			
			
			var newDuration = regionEndAt -regionStartAt
			var oldDuration = lastKeyframeEndAt - firstKeyframeStartAt
			var action = ""
			//console.log('oldduration', oldDuration)
			//console.log('newduration', newDuration)
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
		console.log('current time '+ (time*1000))
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