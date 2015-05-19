var kue = require('kue')
  , jobs = kue.createQueue()
  , cluster = require('cluster');
var FFmpeg = require('plain-ffmpeg');
 
 
 
 var appendRequiredFFMpegOptions = function(job, ffmpegOptions){
	appendGeneralSettings(job, ffmpegOptions);
	appendInputSettings(job, ffmpegOptions);
	appendOutputSettings(job, ffmpegOptions);
 }
 
 var appendGeneralSettings = function(job, ffmpegOptions){
  ffmpegOptions['global'] = {'-y' : null}
 }
 
 var appendInputSettings = function(job, ffmpegOptions){
	if(job.data && job.data.background){
		if(job.data.background.type == 'image'){
			appendImageBGInputSettings(job, ffmpegOptions);
		}else{
			appendColorBGInputSettings(job, ffmpegOptions);
		}
	}else{
		appendColorBGInputSettings(job, ffmpegOptions);
	}
 }
 
 var appendImageBGInputSettings = function(job, ffmpegOptions){
	var outputDirectory = './public/output/' + job.data.dir +'/'
 	ffmpegOptions['input'] = {
				'-loop' : 1,
				'-i' : './public/assets/bk.jpg',
				'-i2' : outputDirectory + 'frame-%d.png'
			}
 }
 
 var appendColorBGInputSettings = function(job, ffmpegOptions){
	var outputDirectory = './public/output/' + job.data.dir +'/'
  	ffmpegOptions['input'] = {
				'-i' : outputDirectory + 'frame-%d.png'
			}
 }
 
 var appendOutputSettings = function(job, ffmpegOptions){
	var outputDirectory = './public/output/' + job.data.dir +'/'
 	ffmpegOptions['output'] = {}
	appendBackgroundOutputSettings(job, ffmpegOptions);
	appendNonBackgroundOutputSettings(job, ffmpegOptions);
 }
 
 var appendBackgroundOutputSettings = function(job, ffmpegOptions){
	if(job.data && job.data.background){
		if(job.data.background.type == 'image'){
			ffmpegOptions['output']['-filter_complex'] = '[0:v] scale=' + getRequiredWidth(job) + ':' + getRequiredHeight(job) +' [first]; [1:v] scale=' + getRequiredWidth(job) + ':' + getRequiredHeight(job) +' [second]; [first][second] overlay=shortest=1'
		}
	}
 }
 
 var appendNonBackgroundOutputSettings = function(job, ffmpegOptions){
	var outputDirectory = './public/output/' + job.data.dir +'/'
	ffmpegOptions['output']['-vcodec'] = 'libx264'
	ffmpegOptions['output']['-r'] = job.data.fps
	ffmpegOptions['output']['-b'] = '1004M'
	ffmpegOptions['output']['-s'] = getRequiredWidth(job) + 'x' + getRequiredHeight(job)
	ffmpegOptions['output'][outputDirectory + 'video.mp4']  = null
 }
 
 var getRequiredHeight = function(job){
	if(job.data.resolutionFactor == 1){
		return 240
	}else if (job.data.resolutionFactor > 1 && job.data.resolutionFactor < 2){
		return 360
	}else if (job.data.resolutionFactor > 2 && job.data.resolutionFactor < 3){
		return 480
	}else if (job.data.resolutionFactor > 3 && job.data.resolutionFactor < 4){
		return 720
	}
 }
 var getRequiredWidth = function(job){
	if(job.data.resolutionFactor == 1){
		return 426
	}else if (job.data.resolutionFactor > 1 && job.data.resolutionFactor < 2){
		return 640
	}else if (job.data.resolutionFactor > 2 && job.data.resolutionFactor < 3){
		return 854
	}else if (job.data.resolutionFactor > 3 && job.data.resolutionFactor < 4){
		return 1280
	}
 } 

function startTask(){
	jobs.process('createVideo', function(job, done){
		console.log('Creating Video');
		var outputDirectory = './public/output/' + job.data.dir +'/'
		var ffmpegOptions = {};
		appendRequiredFFMpegOptions(job, ffmpegOptions);
		console.log('ffmpegOptions is ' , ffmpegOptions);
		var ffmpeg = new FFmpeg(ffmpegOptions);
		ffmpeg.start();
		 
		ffmpeg.on('progress', function(progress) {
			console.log(progress);
		})
		ffmpeg.on('done', function(progress) {
			console.log('video creation is completed from done');
		}) 
		ffmpeg.on('data' , function(error){
			console.log('on data', error);
		})
		ffmpeg.on('exit', function(progress) {
			console.log('video creation is completed from exit');
			done();
		})
		ffmpeg.on('complete', function(progress) {
			console.log('video creation is completed from complete');
		})

		
	});

}
module.exports = startTask