var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
console.log('staring')

  // Workers can share any TCP connection
  // In this case its a HTTP server
  http.createServer(function(req, res) {
    res.writeHead(200);
    res.end("hello world\n");
  }).listen(3000);
  
  
if (cluster.isMaster) {


  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
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
    console.log('worker ' + worker.process.pid + ' died');
  });
  
  
} else {

}