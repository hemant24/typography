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
	
	var AudioTrack = function(file, animator){
		this.file = file;
		this.animator = animator;
		var transition = this.transition = new Transition({from : 100 , to : 200})
		var propertyTransition1 = new PropertyTransition({name : 'top', from : 100, to : 200})
		this.transition.get("propertyTransitions").add( propertyTransition1)
		this.init();
	}
	
	AudioTrack.prototype.init = function(){
		this.wavesurfer = Object.create(WaveSurfer);
		this.wavesurfer.init({
			container: document.querySelector('#wave'),
			waveColor: 'violet',
			progressColor: 'purple',
			cursorWidth : 3,
			scrollParent : true,
			minPxPerSec : 100
		});
		_bindEvents.call(this)
		this.wavesurfer.load('assets/demo.mp3');
	}
	AudioTrack.prototype.addFramesRegion = function(option){
		option.start = option.start;
		option.end = option.end ;
		this.wavesurfer.addFramesRegion(option)
	}
	
	var _bindEvents = function(){
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
			var animatedModel = new AnimateObjectModel({name : "test"});
			_.each(region.data.get("transitionList"), function(t){
				//console.log(t)
				animatedModel.get("transitionList").add(t)
			})
			/*
			console.log('region data is ' , region.data.get("transitionList"))
			console.log('TransitionItemView', TransitionItemView)
			var transitionItemView = new TransitionItemView( {model : region.data.get("transitionList")[0]})
			transitionItemView.render()
			*/
			var transitionView = new TransitionView( {model : animatedModel, fabricObject : region.data})
			transitionView.render()
			
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
		
		this.wavesurfer.on('frames-region-update-end', function(region){
			//console.log('region udpated ', region)
			_updateAnimateFrames.call(this, region)
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
			color: randomColor(0.1)
		});
		this.wavesurfer.backend.on('audioprocess', _progressAnimation.bind(this));
		
		$("#playPause").click(function(){
			this.wavesurfer.playPause()
		}.bind(this))
	}
	
	var _updateAnimateFrames = function(region){
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
				_strechOrSequezeDurationToAllKeyframes.call(this, perChange, animateObject.transitionList, region)
			}
			if(newDuration == oldDuration && regionStartAt !=  firstKeyframeStartAt){
				_addDurationToAllKeyframes.call(this, (regionStartAt - firstKeyframeStartAt), animateObject.transitionList);
			}
		}
	}
	
	var _strechOrSequezeDurationToAllKeyframes = function(perChange, transitionList, region){
		//console.log('it was sequeze or strech , percentage chagne' , perChange)
		var startTime = 0
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
				
				var delta = ((keyframe.get('from') - startTime) * perChange)/100
				//console.log('change in value ' + delta)
				keyframe.set('from', parseInt(keyframe.get('from') + delta))
			}
			if(i != (transitionList.length - 1)){
				//console.log('setting endAt value for other last ')
				var delta2 = (( keyframe.get('to') - startTime)* perChange )/100
				//console.log('befor change' + keyframe.endAt)
				//console.log('change in value ' + delta2)
				keyframe.set('to', parseInt(keyframe.get('to') + delta2))
				//console.log('after change' + keyframe.endAt)
			}else{
				//console.log('setting endAt value for last ')
				//console.log('setting value for last keyframe')
				keyframe.set('to', region.end)
			}
			
		}
	}
	var _addDurationToAllKeyframes = function(duration, transitionList){
		//console.log('it was a move')
		for(var i in transitionList){
			var keyframe = transitionList[i]
			//console.log('befor keyframe startAt ' + keyframe.get('from'))
			//console.log('befor keyframe endAt ' + keyframe.get('to'))
			keyframe.set('from', keyframe.get('from') + duration)
			keyframe.set('to',   keyframe.get('to') + duration)
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