var kue = require('kue')
  , jobs = kue.createQueue()
  , cluster = require('cluster');
var FFmpeg = require('plain-ffmpeg');
 
 
function startTask(){
	jobs.process('mergeAudioVideo', function(job, done){
		console.log('will merge the audio and  Video');
		var outputDirectory = './public/output/' + job.data.dir +'/'
		var ffmpegOptions = {
			global: {'-y': null},
			input: {
				'-i' : outputDirectory + 'video.mp4 ',
				'-i2' :  outputDirectory +'audio.mp3'
			},
			output: {
				'-shortest' : null
			}
		}
		ffmpegOptions['output'][outputDirectory + 'output.mp4'] = null
		var ffmpeg = new FFmpeg(ffmpegOptions);
		ffmpeg.start();
		
		ffmpeg.on('progress', function(progress) {
			console.log('merging of audio and vidoe in progress');
		})
		ffmpeg.on('error', function(e){
			console.log('some error while merge audio and video' , e)
		})
		ffmpeg.on('exit', function(e) {
			console.log('merging of audio and video is completed', e);
			done();
		})
		
		ffmpeg.on('close', function(e) {
			console.log('merging of audio and video is completed', e);
			done();
		})
		
		ffmpeg.on('disconnect', function(e) {
			console.log('merging of audio and video is completed', e);
			done();
		})
		
	});

}
module.exports = startTask