if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	var fabric = require('./Fabric')
	var Properties = require('./Properties')
	var PropertyTransition = require('./NodePropertyTransition')
	var AnimateObjectModel = require('./NodeAnimateObjectModel')
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
			this.animateObjectModel = options.animateObjectModel || new AnimateObjectModel({name : text, fabricObject : this , region : {}});
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
		saveToStartState : function(){ //not needed any more
			 this.stateProperties.forEach(function(prop) {
			  this.startState[prop] = this.get(prop);
			}, this);
		},
		toObject: function() {
			return fabric.util.object.extend(this.callSuper('toObject'), {
			  transitionList: this.get('transitionList')
			});
		},
		addTransition : function(transition, atIndex){
			console.log('atIndex paramter = ' + atIndex)
			console.log('newly add cid' + transition['cid'])
			console.log('b4')
			for(var idx in this.transitionList){
				console.log(this.transitionList[idx]['cid'])
			}
			var listOfPropertiesCurrentlyHave = [];
			var adjustFromToTime = false
			transition.get('propertyTransitions').each(function(propertyTransition){
				listOfPropertiesCurrentlyHave.push(propertyTransition.get('name'))
			});
			console.log('listOfPropertiesCurrentlyHave', listOfPropertiesCurrentlyHave)
			var transitionToFetchFrom = null
			if(atIndex === undefined){
				if(this.transitionList.length == 0){
					atIndex = -1
				}else{
					atIndex = this.transitionList.length - 1
				}
			}else{
				adjustFromToTime = true;
			}
			for(var prop in this.supportedProperties){
				if(listOfPropertiesCurrentlyHave.indexOf(prop) == -1){
					if(atIndex == -1){
						transitionToFetchFrom = this
						transition.get('propertyTransitions').add(new PropertyTransition({name : prop , from : transitionToFetchFrom.get(prop), to : transitionToFetchFrom.get(prop)}))
					}else{
						transitionToFetchFrom = this.transitionList[atIndex]
						console.log('fetching transition from' , transitionToFetchFrom)
						transitionToFetchFrom.get('propertyTransitions').each(function(propTrans){
							if(propTrans.get('name') == prop){
								transition.get('propertyTransitions').add(new PropertyTransition({name : prop , from : propTrans.get('to'), to : propTrans.get('to')}))
							}
						})
					}
				}
			}

				
			
			console.log('atIndex = ' + atIndex)
			this.transitionList.splice(atIndex + 1, 0, transition)
			
			this.animateObjectModel.get("transitionList").add(transition, {at : atIndex + 1, silent : true})
			console.log('after')
			for(var idx in this.transitionList){
				console.log(this.transitionList[idx]['cid'])
			}
			if(adjustFromToTime){
				var newDurationAdded = transition.get('to') - transition.get('from')
				console.log('new duration added' , newDurationAdded)
				console.log('setting from to newly one' + transitionToFetchFrom.get('to'))
				transition.set('from', transitionToFetchFrom.get('to'))
				console.log('setting to to newly one' + (transitionToFetchFrom.get('from')+ newDurationAdded))
				transition.set('to', transition.get('from') + newDurationAdded)
				var lastTransition = this.animateObjectModel.get("transitionList").at(this.animateObjectModel.get("transitionList").length - 1)
				lastTransition.set('to', lastTransition.get('to') + newDurationAdded)
				//now add duration to all remaining frames.
				/*
				for(var i = atIndex+2 ; i < this.transitionList.length ; i++){
					console.log('changing transition of ' + this.transitionList[i]['cid'])
					this.transitionList[i].set('to', this.transitionList[i].get('to') + newDurationAdded)
					this.transitionList[i].set('from', this.transitionList[i].get('from') + newDurationAdded)
				}*/
			}
			
			
			
			//for(var i = atIndex ;i <= 
			console.log('after adding transition list is' , this.transitionList)
			return this;
		},
		addTransitions : function(transitions){
			this.transitionList = transitions
			return this;
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
		getKeyframeByTime : function(time){
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
		updateCoords : function(atTime){
			//console.log('updating coording for ' + this.get('text') + ' , type ' + this.get('type') )
			var startTime = new Date()
			var transition = this.getKeyframeByTime(atTime)
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
		  }
	  
  }
  });