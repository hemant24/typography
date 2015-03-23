var express = require('express');
var router = express.Router();

// Retrieve
var Mongo = require('mongodb')
var MongoClient = Mongo.MongoClient;

var db = null;
var BSON = Mongo.BSONPure;

MongoClient.connect("mongodb://localhost:27017/typography", function(err, database) {
	  if(!err) {
		db = database
	  }
	});


router.post('/', function(req, res, next) {
	var project = req.body;
	var projectsCollection = db.collection('projects');
	projectsCollection.insert(req.body, {w:1}, function(err, result) {
		console.log('project saved successfully');
	})
});

router.get('/', function(req, res, next) {
	try{
	var projectsCollection = db.collection('projects');
	projectsCollection.find().toArray(function(err, items) {
		res.send({projects : items});
	});
	}catch(e){
		console.log(e)
	}
	
});

router.get('/:id' , function(req, res, next){
	var projectId = req.params.id;
	console.log('will load project ' + projectId)
	var projectId = new BSON.ObjectID(projectId);
	
	var projectsCollection = db.collection('projects');
	projectsCollection.findOne({_id : projectId}, function(err, project) {
		res.send({project : project});
	});
})

module.exports = router;
