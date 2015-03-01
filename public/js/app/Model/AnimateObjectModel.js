if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
	require('backbone')
	require('backbone.epoxy')
	
	var AnimateObjectModel = Backbone.Model.extend({
		defaults: {
			name : 'hemant',
            left : 0,
			top : 10
        }
	});
	
	return AnimateObjectModel

})