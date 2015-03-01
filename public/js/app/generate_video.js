//doc : https://www.npmjs.com/package/plain-ffmpeg

var FFmpeg = require('plain-ffmpeg');
 
var ffmpeg = new FFmpeg({
    global: {'-y': null},
    input: {
		'-i' : 'frame-%d.png',
        '-f': 'image2',
		'-r' : '25'
		
    },
    output: {
        '-vcodec': 'libx264',
		
		
		'test.mp4': null
    }
});
ffmpeg.start();
 
ffmpeg.on('progress', function(progress) {
    console.log(progress);
})