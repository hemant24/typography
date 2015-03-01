var mymodule = require('./AObjects')
var fs = require('fs'),
    fabric = require('fabric').fabric;
	
	
var canvas = fabric.createCanvasForNode(512, 378);

var text1 = new fabric.AText(
"Hemant",
{
  left: 100,
  top: 100,
    fontFamily: 'Impact',
 fill   : 'rgb(0,200,0)',
   fontSize: 80
}).keyframe(100, 500, {top : '130'},fabric.util.ease.easeOutBounce);


canvas.add(text1)
output()

function output(){
	canvas.renderAll()

	var stream = canvas.createPNGStream()
	var  out = fs.createWriteStream(__dirname + '/frame.png');
	console.log('hello')
	//console.log(rect)
	stream.pipe(out);
}
