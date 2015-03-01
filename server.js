
var app = require('./app');
var createFrameTask = require('./tasks/createFrame')
var createVideoTask = require('./tasks/createVideo')
var http = require('http');

var server = http.createServer(app);
var coreSize = require('os').cpus().length;
var kue = require('kue')
  , jobs = kue.createQueue()
  , cluster = require('cluster');

var io = require('socket.io')(server);
io.on('connection', function(socket){
	socket.emit('welcome', {test:'dummy'})
   console.log('user connected');
});



if(cluster.isMaster){
	//if master listen to url
	server.listen(3000);
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
	console.log(createFrameTask)
	createFrameTask();
	createVideoTask();
}



module.exports = server;