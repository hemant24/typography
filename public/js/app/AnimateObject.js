if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var Keyframe = require('./Keyframe')
	var fabric = require('./Fabric')
	var Properties = require('./Properties')
	var PropertyTransition = require('./NodePropertyTransition') //Will break node compatibility
	return {
		initialize: function() {
			var text="defalt" ,options={}
			if(arguments.length == 2){
				text = arguments[0]
				options = arguments[1]
				this.callSuper('initialize', text, options);
			}else{
				options = arguments[0]
				this.callSuper('initialize', options);
			}
			this.keyframeList = options.keyframeList || [];
			this.transitionList = options.transitionList || [];
			this.startState = options.startState || {};
			this.listOfStartedTransitions = [];
			this.canvas = null;
			this.supportedProperties = {
				top : '',
				left : '',
				angle : '',
				fontSize : '',
				scaleX : '',
				scaleY : '',
				opacity : ''
			
			}
			return this;
		},
		show : function(){
			//console.log('I am custom class')
		},
		saveToStartState : function(){
			 this.stateProperties.forEach(function(prop) {
			  this.startState[prop] = this.get(prop);
			}, this);
		},
		toObject: function() {
			return fabric.util.object.extend(this.callSuper('toObject'), {
			  transitionList: this.get('transitionList')
			});
		},
		toObject_Old: function() {
			var keyframeList = this.get('keyframeList')
			for(var i in keyframeList){
				keyframeList[i]['easeFn'] = 'fabric.util.ease.' + keyframeList[i]['easing'].name
			}
			return fabric.util.object.extend(this.callSuper('toObject'), {
			  keyframeList: this.get('keyframeList')
			});
		},
		keyframe :  function(startTime, endTime, from, to, easing){
			this.keyframeList.push( new Keyframe(startTime, endTime, from, to, easing));
			return this;
		},
		addTransition : function(transition, atIndex){
			var listOfPropertiesCurrentlyHave = [];
			transition.get('propertyTransitions').each(function(propertyTransition){
				listOfPropertiesCurrentlyHave.push(propertyTransition.get('name'))
			});
			var transitionToFetchFrom = null
			if(!atIndex){
				if(this.transitionList.length == 0){
					atIndex = -1
				}else{
					atIndex = this.transitionList.length - 1
				}
			}
			for(var prop in this.supportedProperties){
				if(listOfPropertiesCurrentlyHave.indexOf(prop) == -1){
					if(atIndex == -1){
						transitionToFetchFrom = this
						transition.get('propertyTransitions').add(new PropertyTransition({name : prop , from : transitionToFetchFrom.get(prop), to : transitionToFetchFrom.get(prop)}))
					}else{
						transitionToFetchFrom = this.transitionList[atIndex]
						transitionToFetchFrom.get('propertyTransitions').each(function(propTrans){
							if(propTrans.get('name') == prop){
								transition.get('propertyTransitions').add(new PropertyTransition({name : prop , from : propTrans.get('to'), to : propTrans.get('to')}))
							}
						})
					}
				}
			}
			this.transitionList.push(transition)
			return this;
		},
		addTransitions : function(transitions){
			this.transitionList = transitions
			return this;
		},
		timeToAnimate : function(time){
			var keyframe = this.getKeyframeByTime(time)
			//console.log(keyframe)
			if(keyframe == null){
				return false;
			}else{
				return true;
			}
		},
		_markOldStartedTransitionsAsFinished : function(now){
			//console.log(this.transitionList)
			var lastTransitionOfObject = this.transitionList[this.transitionList.length - 1]
			if(lastTransitionOfObject.toJSON){
				lastTransitionOfObject = lastTransitionOfObject.toJSON()
			}
			var lastTransitionEndTime = lastTransitionOfObject['to']
			//console.log('now inside forwad frame' + now)
			//console.log('lastTransitionEndTime ' + lastTransitionEndTime)
			if(now > lastTransitionEndTime){
				//console.log('going to remove the object')
				if(this.canvas && this.canvas.contains(this)){
					this.canvas.remove(this);
				}
				/*
				for(var i in lastTransitionOfObject['propertyTransitions']){
					var propertyTransition = lastTransitionOfObject['propertyTransitions'][i]
					this.set(propertyTransition['name'], propertyTransition['to'])
				}*/
			}else{
				for(var i in this.listOfStartedTransitions){
						var startedTransition = this.listOfStartedTransitions[i]
						var endTime = startedTransition['transition']['to']
						if(now > endTime){
							//console.log('now time did not completed last started one marking it complete')
							for(var i in startedTransition['transition']['propertyTransitions']){
								var propertyTransition = startedTransition['transition']['propertyTransitions'][i]
								//console.log('changing property ' + propertyTransition['name'] + ' from' + propertyTransition['from'] + ' to ' + propertyTransition['to'])
								//console.log('fast forword value', parseFloat(propertyTransition['to']))
								this.set(propertyTransition['name'], parseFloat(propertyTransition['to']))
							}
						}
						
				}
			}
			this.listOfStartedTransitions.length = 0
			this.listOfStartedTransitions = []
		},
		getKeyframeByTime2 : function(time){
			for(var i in this.transitionList){
				var transition = this.transitionList[i]
				if(transition.toJSON){
					transition = transition.toJSON()
				}
				if(time >= transition['from'] && time <= transition['to']){
					return transition;
				}
			}
		},
		updateCoords2 : function(atTime){
			//console.log('updating coording for ' + this.get('text') + ' , type ' + this.get('type') )
			var startTime = new Date()
			var transition = this.getKeyframeByTime2(atTime)
			//console.log('atTime' , atTime)
			//console.log('transition', transition)
			var endTime = new Date()
			//console.log('length of last started : ' +  this.listOfStartedTransitions.length )
		    if(this.listOfStartedTransitions.length > 0) {
				this._markOldStartedTransitionsAsFinished(atTime)
			}
			//console.log('length of last started after marking it as finished: ' +  this.listOfStartedTransitions.length )
			if(transition){
			  if(!this.canvas.contains(this)){
				this.canvas.add(this);
			  }
			  this.listOfStartedTransitions.push({startedAt : atTime, transition : transition});
			  //console.log('length of last started after finding transition :  ' +  this.listOfStartedTransitions.length )
			  //console.log('took : ', endTime - startTime, ' to search for keyframe')
				//console.log('keyframebytime' , keyframe)
			  var propsToAnimate = [ ], prop, skipCallbacks;
			  
			  for (var i = 0, len = transition.propertyTransitions.length; i < len; i++) {
				var propertyTransition = transition.propertyTransitions[i];
				skipCallbacks = i !== len - 1;
				//console.log('keyframe.easeFn is null ', keyframe.easeFn == null)
				
				var easeFn = function(t, b, c, d) {return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;}
				if(propertyTransition.ease == null){
					if(propertyTransition.easeFn != null){
						easeFn = eval(propertyTransition.easeFn)
					}
				}else{
					easeFn = propertyTransition.ease
				}
				this._animate2(propertyTransition['name'], propertyTransition['to'], 
									{	duration : transition['from'] - transition['to'],
										startAt : transition['from'],
										endAt : transition['to'],
										seekAt : atTime,
										easing : easeFn,
										onComplete : function(){
											//console.log('animation completed')
										},
										from :  propertyTransition['from']
									}, skipCallbacks);
			  }
			}
		},
		getKeyframeByTime : function(time){
			//console.log(this.keyframeList)
			for(var i in this.keyframeList){
				var keyframe = this.keyframeList[i]
				/*console.log(keyframe)
				console.log('time', time)
				console.log('keyframe.startAt' , keyframe.startAt)
				console.log('keyframe.endAt' , keyframe.endAt)
				console.log(time >= keyframe.startAt && time <= keyframe.endAt)*/
				if(time >= keyframe.startAt && time <= keyframe.endAt){
					return keyframe;
				}
			}
			return null;
		},
		updateCoords : function(atTime){
			var keyframe = this.getKeyframeByTime(atTime)
			
			if(keyframe){
				//console.log('keyframebytime' , keyframe)
			  var propsToAnimate = [ ], prop, skipCallbacks;
			  for(prop in keyframe.to){
				//console.log('prop', prop)
				//console.log('from', keyframe.from[prop])
				//console.log('to' , keyframe.to[prop])
				if(keyframe.from[prop] !=  keyframe.to[prop]){
					propsToAnimate.push(prop);
				}
			  }
			  //console.log('prop to animat' ,propsToAnimate)
			  /*
			  for (prop in keyframe.properties) {
				propsToAnimate.push(prop);
			  }*/
			  for (var i = 0, len = propsToAnimate.length; i < len; i++) {
				prop = propsToAnimate[i];
				skipCallbacks = i !== len - 1;
				//console.log('keyframe.easeFn is null ', keyframe.easeFn == null)
				
				var easeFn = function(t, b, c, d) {return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;}
				if(keyframe.easing == null){
					if(keyframe.easeFn != null){
						easeFn = eval(keyframe.easeFn)
					}
				}else{
					easeFn = keyframe.easing
				}
				this._animate2(prop, keyframe['to'][prop], 
									{	duration : keyframe.endAt - keyframe.startAt,
										startAt : keyframe.startAt,
										endAt : keyframe.endAt,
										seekAt : atTime,
										easing : easeFn,
										onComplete : function(){
											//console.log('animation completed')
										},
										from : keyframe['from'][prop]
									}, skipCallbacks);
			  }
			}
		},
		_animate2: function(property, to, options, skipCallbacks) {
			var _this = this, propPair;

			to = to.toString();

			if (!options) {
			  options = { };
			}
			else {
			  options = fabric.util.object.clone(options);
			}
			/* Not clear yet
			if (~property.indexOf('.')) {
			  propPair = property.split('.');
			}

			var currentValue = propPair
			  ? this.get(propPair[0])[propPair[1]]
			  : this.get(property);*/
			  
			//var currentValue = this.get(property);
			//console.log(options)
			if (!('from' in options)) {
			  options.from = currentValue;
			}else{
				options.from  = parseFloat(options.from)
			}

			if (~to.indexOf('=')) {
			  to = currentValue + parseFloat(to.replace('=', ''));
			}
			else {
			  to = parseFloat(to);
			}
			var byValue = to -  options.from;
			//console.log('start at' , options.startAt)
			//console.log('time' , options.seekAt - options.startAt, 'from : ' , options.from,'to', to,'duraation', options.duration, 'byValue', byValue)
			//console.log('easing' , options.easing.name)
			var value = options.easing(options.seekAt - options.startAt, options.from, byValue,  options.duration);
			//console.log('value is', value)
			//console.log(options.seekAt - options.startAt, value)
			if (propPair) {
				_this[propPair[0]][propPair[1]] = value;
			}
			else {
			  _this.set(property, value);
			}
			if (skipCallbacks) {
				//return;
			}else{
				options.onChange && options.onChange();
			}
			//_this.setCoords();
			/*
			fabric.util.animate({
			  startValue: options.from,
			  endValue: to,
			  easing: options.easing,
			  duration: options.duration,
			  abort: options.abort && function() {
				return options.abort.call(_this);
			  },
			  onChange: function(value) {
				if (propPair) {
				  _this[propPair[0]][propPair[1]] = value;
				}
				else {
				  _this.set(property, value);
				}
				if (skipCallbacks) {
				  return;
				}
				options.onChange && options.onChange();
			  },
			  onComplete: function() {
				console.log('oncomplete called', options)
				if (skipCallbacks) {
				  return;
				}

				_this.setCoords();
				console.log('going to call oncomplete')
				options.onComplete && options.onComplete();
			  }
			});*/
		  },
		start : function(time){
			var keyframe = this.getKeyframeByTime(time)
//			console.log('keyframebytime' , keyframe)
			if(keyframe && !keyframe.running){
				//console.log('goingt to animate', this, keyframe.properties, keyframe.startAt, keyframe.endAt)
				this.animate(keyframe.properties, {
				  duration: keyframe.endAt - keyframe.startAt,
				  easing : keyframe.easing,
				  onComplete : function(){
					//console.log('on complete called', this)
					keyframe.running = false;
				  }
				});
				keyframe.running = true;	
			}
		}
	  
  }
  });