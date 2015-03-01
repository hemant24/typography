var express = require('express');
var upload = require('jquery-file-upload-middleware');
var fs = require('fs')
function handleAudioUpload (req, res, next) {
			console.log('dir to upload' , req.query.dir)
            // imageVersions are taken from upload.configure()
            upload.fileHandler({
                uploadDir: function () {
                    return  './public/output/' + req.query.dir
                }
            })(req, res, next);
			
			 upload.on('end', function (fileInfo, req, res) {
				fs.rename('./public/output/' + req.query.dir + '/' + fileInfo.name, './public/output/' + req.query.dir + '/input.mp3')
			 });
        }
		

module.exports = handleAudioUpload;