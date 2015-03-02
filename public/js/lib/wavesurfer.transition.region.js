
if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
var WaveSurfer = require('wavesurfer');
require('drawer');
'use strict';

/* Transition Region manager */
WaveSurfer.TransitionRegions = {
    init: function (element, transitions, params) {
		this.drawer = Object.create(WaveSurfer.Drawer);
        this.drawer.init(element,
			{
				cursorWidth : 0,
				scrollParent : true,
				height : params.height,
				backgroundColor : params.backgroundColor
			});
		console.log('called frames regions construct')
        /* Id-based hash of regions. */
        this.list = {};
		this.region = Object.create(WaveSurfer.TransitionRegion)
		this.region.init(this.drawer, params)
    }
};

WaveSurfer.TransitionRegion = {
    /* Helper function to assign CSS styles. */
    style: WaveSurfer.Drawer.style,

    init: function (drawer, params) {
		this.wrapper = drawer.wrapper;
		this.render();
    },
	 /* Render a region as a DOM element. */
    render: function () {
        var regionEl = document.createElement('transitionregion');
        regionEl.className = 'transition-region';
        //regionEl.title = this.formatTime(this.start, this.end);

        this.style(regionEl, {
            position: 'absolute',
            zIndex: 3,
			width : '10px',
			'background-color': 'black',
			left : '20px',
            height: '15px',
            top:  0,
			opacity : 0.7
        });

        
        this.element = this.wrapper.appendChild(regionEl);
    },
	
};

WaveSurfer.util.extend(WaveSurfer.TransitionRegion, WaveSurfer.Observer);

});