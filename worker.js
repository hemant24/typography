var program = require('commander'),
cluster = require('cluster'),
coreSize = require('os').cpus().length;

var createFrameTask = require('./tasks/createFrame')
var createVideoTask = require('./tasks/createVideo')
var mergeAudioVideoTask = require('./tasks/mergeAudioVideo')
var typographyTask = require('./tasks/typographyTask')

/*
program
  .version('0.0.1')
  .option('start, --start', 'start worker')
  .parse(process.argv);
*/

if(cluster.isMaster){
	console.log('yes its master')
	typographyTask();
	for (var i = 0; i < coreSize -1 ; i++) {
		cluster.fork();
	}
	cluster.on('online', function(worker) {
		console.log("Yay, the worker responded after it was forked");
	});
	
	cluster.on('listening', function(worker, address) {
		console.log("A worker is now connected to " + address.address + ":" + address.port);
	});
	
	cluster.on('disconnect', function(worker) {
	  console.log('The worker #' + worker.id + ' has disconnected');
	});
	
	cluster.on('exit', function(worker, code, signal) {
	  console.log('worker %d died (%s). restarting...',
		worker.process.pid, signal || code);
	});

	
}else{
	createFrameTask();
	createVideoTask();
	mergeAudioVideoTask();
}