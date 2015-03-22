if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
 'use strict';
var Id = function(){

}
var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
	charSetSize = charSet.length, 
	charCount = 13, 
	idCount = 1;

Id['getNew'] = function() {
	var id = '';
	for (var i = 1; i <= charCount; i++) {
		var randPos = Math.floor(Math.random() * charSetSize);
		id += charSet[randPos];
	}
	return id;
};

return Id

});