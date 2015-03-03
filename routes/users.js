var express = require('express');
var router = express.Router();
var Previewer = require('./../public/js/app/Previewer')
var Animator = require('./../public/js/app/Animator')
var fabric = require('fabric').fabric
var async = require('async')
var coreSize = require('os').cpus().length;
var fs = require('fs')
var uuid = require('node-uuid')
var kue = require('kue')
  , jobs = kue.createQueue()
  , cluster = require('cluster');
  


 jobs.on('job enqueue', function(id,type){
  console.log( 'job %s got queued', id );
});

/*
jobs.on('job complete', function(id,result){
 // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>job is completed : ' + id)
  kue.Job.get(id, function(err, job){
    console.log('jobs total worker was' , job.data.totalWorker)
  });
});
*/

router.post('/', function(req, res, next) {
	//console.log(req.body)
	//Previewer.preview(req.body, 10000, 3)
	var dir = uuid.v4()
	frameCreationJob(req.body, dir);
	res.send({url : dir , filename :  'output.mp4' });
});

var frameCreationJob = function(payload, dir){

  console.log('will process data' , payload);
  var totalNoOfFrames = parseInt( (payload['playLength']/1000) * payload['fps'])
  var height = payload['height']
  var width = payload['width']
  var totalNoOfCores = coreSize - 1
  var lastFrames = totalNoOfFrames % totalNoOfCores
  var eachCoreFrameSize = parseInt(totalNoOfFrames/totalNoOfCores)
  
  
  console.log('total frames', totalNoOfFrames, 'total cores', totalNoOfCores, 'lastFrames' , lastFrames, 'eachCoreFrameSize', eachCoreFrameSize)
  
  for(var c=0 ; c < totalNoOfCores ; c++){
	console.log('creating task for core ' + c)
	var from = c*eachCoreFrameSize
	console.log('from frame ' + from)
	var to = from + eachCoreFrameSize - 1
	if(c == (totalNoOfCores-1)){
		console.log('this one is last frame adding ', lastFrames , ' to to')
		to = to+lastFrames+1
	}
	console.log('to frame ' + to)
	
	var job = jobs.create('createFrames', {
		title: 'Creation of Frames',
		payload : payload,
		from : from,
		to : to,
		dir :  dir,
		height : height,
		width : width,
		totalWorker : totalNoOfCores
	}).save( function(err){
	   if( !err ) console.log( job.id );
	});
	
  job.on('complete', function(){
	job.data.totalWorker = job.data.totalWorker -1
	if(job.data.totalWorker == 0 ){
		console.log('this was last one')
		console.log('All worker has created the frames now going to creat video')
		var videoJob = jobs.create('createVideo', {
			title: 'Creation of Video',
			folderName : 'toadd',
			musicFile : 'toadd',
			dir : job.data.dir,
			height : job.data.height,
			width : job.data.width,
			fps : job.data.payload.fps
		}).save( function(err){
		   if( !err ) console.log( videoJob.id );
		});
		
	
	}
	console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>job is completed : ', job.data.totalWorker)
  })
  
  
  }
  
  
  

  
}

var startCreatingFrames = function(animator, playLength, delta){
	var frames = []
	for(var i=0 ; i<=playLength ; i = i+delta){
		frames.push(i)
	}
	var frameCount = 0
	console.log('series is' , frames)
	
	async.eachSeries(frames, function(frameNumber, callback) {
		console.log('frameNumber', frameNumber)
		this.seek(frameNumber);
		var stream = this.canvas.createPNGStream()
		var out = fs.createWriteStream('./output/frame-' + frameCount +'.png');
		stream.on('data', function(chunk) {
			out.write(chunk);
		  });
		 
		  stream.on('end', function() {
			   out.end();
			   frameCount++;
			  callback()
		  });
	}.bind(animator))
	
}
/*
jobs.process('createFrames', function(job, done){
  
  console.log('will process data' , job.data.payload);
  var totalNoOfFrames = parseInt( (job.data.payload['playLength']/1000) * job.data.payload['fps'])
  var totalNoOfCores = coreSize - 1
  var lastFrames = totalNoOfFrames % totalNoOfCores
  var eachCoreFrameSize = parseInt(totalNoOfFrames/totalNoOfCores)
  
  
  console.log('total frames', totalNoOfFrames, 'total cores', totalNoOfCores, 'lastFrames' , lastFrames, 'eachCoreFrameSize', eachCoreFrameSize)
  
  for(var c=0 ; c < totalNoOfCores ; c++){
	console.log('creating task for core ' + c)
	var from = c*eachCoreFrameSize
	console.log('from frame ' + from)
	var to = from + eachCoreFrameSize - 1
	if(c == (totalNoOfCores-1)){
		console.log('this one is last frame adding ', lastFrames , ' to to')
		to = to+lastFrames+1
	}
	console.log('to frame ' + to)
  }
  
  
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
			//startCreatingFrames(animator, job.data.payload['playLength'], 1000/job.data.payload['fps'])
		}, function(o, object){
			animator.add(object)
		} )
		
  //Previewer.preview(job.data.payload['fabricCanvas'], 3000, job.data.payload['quality']);

  console.log('processing over')
  done();
});
*/

module.exports = router;
