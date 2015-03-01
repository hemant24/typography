var fs = require('fs'),
    fabric = require('fabric').fabric;


var canvas = fabric.createCanvasForNode(512, 378);


var redish = new fabric.Color('#f55');
// create a rectangle object
var text1 = new fabric.Text(
"Hemant",
{
  left: 100,
  top: 100,
    fontFamily: 'Impact',
 fill   : 'rgb(0,200,0)',
   fontSize: 80
});
var text2 = new fabric.Text(
"Sachdeva",
{
  left: 700,
  top: 80,
   fontFamily: 'Impact',
fill : '#c3bfbf',
   fontSize: 80

});

var text3 = new fabric.Text(
"Sandip",
{
  left: 80,
  top: 880,
   fontFamily: 'Impact',
	fill   : 'red',
   fontSize: 130

});

var text4 = new fabric.Text(
	"test",
	{
		left : 1000,
		top : 1000,
		fontFamily: 'Impact',
		fill   : 'red',
	   fontSize: 130
	}
)

canvas.add(text1)
canvas.add(text2)
canvas.add(text3)
canvas.add(text4)

text2.animate('left', 80, {duration: 2000,
  onChange: output,
  easing: fabric.util.ease.easeOutBounce,
  onComplete : function(){
  console.log('comple')
	text3.animate('top', 140 , {duration : 200, onChange: output, onComplete : function(){
		text4.animate('top', 999, {duration : 1000, onChange: output})
	}})
  }})
  
text1.animate('angle', 90, {
 duration: 500,
  onChange: output
});

var i = 0
function output(){
	canvas.renderAll()

	var stream = canvas.createPNGStream()
	var  out = fs.createWriteStream(__dirname + '/frame-' + i +'.png');
	i++;
	console.log('hello')
	//console.log(rect)
	stream.pipe(out);
}