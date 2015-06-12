var kue = require('kue')
  , jobs = kue.createQueue()
  , cluster = require('cluster')
  , coreSize = require('os').cpus().length;
 
function startTask(){
	jobs.process('typography', function(job, done){
		console.log('typograph task is called');
		frameCreationJob(job.data.payload, job.data.dir);
		done();
	});

}
var frameCreationJob = function(payload, dir){

  //console.log('will process data' , payload);
  var totalNoOfFrames = parseInt( (payload['playLength']/1000) * payload['fps'])
  var height = payload['height']
  var width = payload['width']
  var resolutionFactor = payload['resolutionFactor']
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
		resolutionFactor : resolutionFactor,
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
			resolutionFactor : resolutionFactor,
			fps : job.data.payload.fps,
			background : payload['background']
		}).save( function(err){
		   if( !err ) console.log( videoJob.id );
		});
		
		videoJob.on('complete', function(){
			console.log('will start the merge job');
			var audioVideoJob = jobs.create('mergeAudioVideo', {
				title: 'Merge Audio and Video',
				dir : job.data.dir,
			}).save( function(err){
			   if( !err ) console.log( audioVideoJob.id );
			});
		
		})
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

module.exports = startTask