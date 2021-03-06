if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('wavesurfer.regions')
	var srtParser = require('subtitle.parser')
	var AnimationPalete = require('./AnimationPalete');
	var GroupAnimationPalete = require('./GroupAnimationPalete');
	var WordGroupUtil =  require('./WordGroupUtil');
	var SrtObjectGenerator = function(params){
		this.audioTrack = params.audioTrack
	}

	SrtObjectGenerator.prototype.generate = function(){
		var audioRegions = srtParser.fromSrt($("#lyrics").val(), true)
		if(this.audioTrack){
			for(var i in audioRegions){
				var region = audioRegions[i]
				setTimeout(function(region){
					return function(){
						addRandomAnimation.call(this, region)
					}.bind(this)
				}.bind(this)(region), 10)
			}
		}else{
			alert('Please supply valid audio file');
		}
	}
	
	var addRandomAnimation = function(region){
		var startTime = region.startTime;
		var endTime = region.endTime;
		
		this.audioTrack.wavesurfer.addRegion({
			start : startTime/1000,
			end : endTime/1000
			})
		var eachWordDurationMapList = WordGroupUtil.eachWordDurationMapList(region.text, startTime, endTime);
		//console.log('eachWordDurationMapList', eachWordDurationMapList)
		var paleteIndex = getRandomPalete();
		var previousObjectList = [];
		//console.log('paleteIndex '+ paleteIndex)
		for(var i in eachWordDurationMapList){
			var wordDurationMap = eachWordDurationMapList[i];
			
				
			//console.log('added text is ' , text)
			if(paleteIndex > 1 && paleteIndex <= 4){
				var text = this.audioTrack.addTextObjectToAnimator({
					text : wordDurationMap.word,
					startTime : wordDurationMap.start,
					endTime : endTime//wordDurationMap.end
				})
				this.audioTrack.setRandomFont(text);
				previousObjectList.push(text);
				GroupAnimationPalete.topBottom({
					object : text,
					previousObjectList : previousObjectList,
					startTime : wordDurationMap.start,
					endTime : wordDurationMap.end
				}, {
					camera : this.audioTrack.animator.getCamera()
				},{
					startTime : startTime,
					endTime : endTime, 
					totalObject : eachWordDurationMapList.length,
					currentObjectIndex : parseInt(i) + 1
				},{
					transition : { in : AnimationPalete.getRandomInTransition(), out : AnimationPalete.getRandomOutTransition()},
					audioTrack : this.audioTrack
				})
			}else{
				var text = this.audioTrack.addTextObjectToAnimator({
					text : wordDurationMap.word,
					startTime : wordDurationMap.start,
					endTime : wordDurationMap.end
				})
				this.audioTrack.setRandomFont(text);
				AnimationPalete.addTransitionToObject({ in : AnimationPalete.getRandomInTransition(), out : AnimationPalete.getRandomOutTransition()}, text, wordDurationMap.start, wordDurationMap.end, this.audioTrack.animator.getCamera());
			}
		}
	}
	
	
	var getRandomPalete = function(){
		var index = Math.floor(Math.random() * 4);
		return index;
	}
	
	var _totalDuration = function(start , end){
		return end - start
	}
	var _eachWordDurationMapList = function(line, start , end){
		var totalDuration = _totalDuration(start, end);
		console.log('parsing line' , line)
		var wordList = _getWordList(line);
		console.log('after parsing' , wordList)
		var eachWordDuration = parseInt(totalDuration/wordList.length);
		var wordDurationMap = []
		var elapsedTime = start
		for(var i in wordList){
			var word = wordList[i];
			wordDurationMap.push({
				start : elapsedTime,
				end : elapsedTime + eachWordDuration,
				word : word
			})
			if(i == wordList.length-1){
				wordDurationMap[i]['end'] = end;
			}
			elapsedTime = elapsedTime + eachWordDuration
		}
		return wordDurationMap
	}
	
	var _getWordList = function(line){
		var line = $.trim(line);
		line = line.replace(/[ \t\r\n]+/g," ");
		var wordList = line.split(" ");
		return wordList;
	}
	return SrtObjectGenerator
})