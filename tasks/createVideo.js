var kue = require('kue')
  , jobs = kue.createQueue()
  , cluster = require('cluster');
var FFmpeg = require('plain-ffmpeg');
 
 
function startTask(){
	jobs.process('createVideo', function(job, done){
		console.log('Creating Video');
		var outputDirectory = './public/output/' + job.data.dir +'/'
		var ffmpegOptions = {
			global: {'-y': null},
			input: {
				'-i' : outputDirectory + 'frame-%d.png',
				'-f': 'image2',
				'-r' : job.data.fps
				
				
			},
			output: {
				'-vcodec': 'libx264',
				//'-vcodec': 'mpeg4',
				'-b' :  '1004M',
				'-s' :  job.data.height + 'x' + job.data.width,
				//'-crf' : '1', 
			}
		}
		
		ffmpegOptions['output'][outputDirectory + 'output.mp4'] = null
		var ffmpeg = new FFmpeg(ffmpegOptions);
		ffmpeg.start();
		 
		ffmpeg.on('progress', function(progress) {
			console.log(progress);
		})

		
	});

}
module.exports = startTask