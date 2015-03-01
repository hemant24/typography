requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app'
    },
	
	shim: {
		'socket.io': {
			exports: 'io'
		},
		'fabric': {
            exports: 'fabric'
        },
		'jquery.layout' : {
			deps : ['jquery', 'jquery.ui.all']
		},
		'jquery.ui.all' : {
			deps : ['jquery']
		},
		'jquery.layout.resizePaneAccordions' : {
			deps : ['jquery','jquery.layout']
		},
		'underscore' : {
			exports : '_'
		},
		'backbone' : {
			deps : ['underscore']
		},
		'backbone.epoxy' : {
			deps : ['backbone', 'jquery']
		},
		'backbone.associations' : {
			deps : ['backbone']
		}
		
	}
});

// Start the main app logic.
requirejs(['jquery', 'app/Main'],
function   ($, main) {
    //jQuery, canvas and the app/sub module are all
    //loaded and can be used here now.
});