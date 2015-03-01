var motionText = motionText || {};




(function(global){

var canvas = new fabric.Canvas('cc');
var animator = new motionText.Animator(canvas);
var drawingArea = new motionText.DrawingArea(canvas, "#drawingArea")

var aText = new fabric.AText(
"Hemant", {
  left: 200,
  top: -200,
  fontFamily: 'Impact',
  fill   : 'rgb(0,200,0)',
  angle : 90,
  fontSize: 80
}).keyframe(100, 500, {top : '130'},fabric.util.ease.easeOutBounce)
.keyframe(500, 800, {angle : '0'},fabric.util.ease.easeOutBounce)
.keyframe(1600, 1800, {fontSize : '800',opacity : 0, top: 500, left : -500},fabric.util.ease.easeOutBounce)
animator.add(aText)
aText.saveToStartState();
aText.on('selected' , function(){

	console.log(this)
})

var camera = new fabric.ARect({
  left: 100,
  top: 100,
  fill: null,
  stroke: "red",
  strokeWidth: 3,
  width: 300,
  height: 300
}).keyframe(800, 900, {left : 170});
camera.lockScalingX = true;
camera.lockScalingY = true;
camera.lockRotation = true;
camera.saveToStartState();

animator.add(camera)

animator.play();
	
	
$("#preview").click(function(){
	motionText.Previewer.preview(canvas)
})
	

})(window)