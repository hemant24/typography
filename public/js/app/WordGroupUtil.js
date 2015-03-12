if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	
	
	var WordGroupUtil = {}
	
	
	WordGroupUtil.totalDuration = function(start , end){
		return end - start
	}
	WordGroupUtil.eachWordDurationMapList = function(line, start , end){
		var totalDuration =  WordGroupUtil.totalDuration(start, end);
		//console.log('parsing line' , line)
		var wordList =  WordGroupUtil.getWordList(line);
		//console.log('after parsing' , wordList)
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
	
	WordGroupUtil.getWordList = function(line){
		var line = $.trim(line);
		line = line.replace(/[ \t\r\n]+/g," ");
		var wordList = line.split(" ");
		return wordList;
	}
	
	return WordGroupUtil;
})