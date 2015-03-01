var kue = require('kue')
  , jobs = kue.createQueue()
  , cluster = require('cluster');
var Previewer = require('./../public/js/app/Previewer')
var Animator = require('./../public/js/app/Animator')
var fabric = require('fabric').fabric
var async = require('async')
var fs = require('fs')

function startTask(){
	jobs.process('createFrames', function(job, done){
		console.log('in directory', job.data.dir,' from frame' , job.data.from,'to frame' , job.data.to,  'will proce sdss data' , job.data.payload, 'totalWorker ' , job.data.totalWorker);
  
		var canvas = fabric.createCanvasForNode(300 * job.data.payload['quality'], 300 * job.data.payload['quality']);
		var animator = new Animator(canvas, 'server', job.data.payload['playLength']);
		canvas.loadFromJSON(job.data.payload['fabricCanvas'], 
		function(){
			for(var i in animator._objs){
				var objectToRemove = animator._objs[i];
				if(objectToRemove.get('type') != 'aCamera'){
					canvas.remove(objectToRemove);
				}else{
					objectToRemove.set('quality', job.data.payload['quality'])
				}
			}
			//console.log('canvas is loaded will start creating frames')
			startCreatingFrames(animator, job, done)
		}, function(o, object){
			animator.add(object)
		} )
		
	});

}

var startCreatingFrames = function(animator, job, done){
var fromFrame = job.data.from
var toFrame = job.data.to
var delta = 1000/job.data.payload['fps']
var dir = './public/output/'+job.data.dir+'/'
console.log('create dir', dir)

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

console.log('delta is' , delta)
	var frames = []
	for(var i=fromFrame ; i<=toFrame ; i++){
		console.log('i is ', i)
		var toAdd = i*delta
		console.log('toAdd' , toAdd)
		frames.push(toAdd)
	}
	var frameCount = fromFrame
	console.log('series is' , frames)
	
	async.eachSeries(frames, function(frameNumber, callback) {
		console.log('frameNumber', frameNumber)
		this.seek(frameNumber);
		var stream = this.canvas.createPNGStream()
		var out = fs.createWriteStream(dir+'frame-' + frameCount +'.png');
		stream.on('data', function(chunk) {
			out.write(chunk);
		  });
		 
		  stream.on('end', function() {
			   out.end();
			   frameCount++;
			  callback()
		  });
	}.bind(animator), function(err){
		done();
		//console.log('series are over ..............>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
	})
	
}


module.exports = startTask