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
	createTypographyJob(req.body, dir);
	//frameCreationJob(req.body, dir);
	res.send({url : dir , filename :  'output.mp4' });
});

var createTypographyJob = function(payload, dir){
	var job = jobs.create('typography', {
		payload : payload,
		dir :  dir
	}).save( function(err){
	   if( !err ) console.log( job.id );
	});
}

module.exports = router;
