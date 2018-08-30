/*eslint-env node*/
 
 var express = require('express');
 var app = express();
 
 
 var cfenv = require('cfenv');
 
 
 var bodyParser  =   require("body-parser");
 var multer = require('multer');
 var path = require('path');
 
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({"extended" : false}));
 
 
 // serve the files out of ./public as our main files
 app.use(express.static(__dirname + '/public'));

var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/images'); // set the destination
    },
    filename: function(req, file, callback){
        callback(null, Date.now() + '.jpg'); // set the file name and extension
    }
});

var upload = multer({storage: storage});
 
 app.upload = upload;
 
 // get the app environment from Cloud Foundry
 var appEnv = cfenv.getAppEnv();
  
/* ************************************************* */
var token = require('./routes/token');
app.use('/token', token);
  
 /**********************  Watson Visual Recognition  *********************************/
var watson = require('watson-developer-cloud');

var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var fs = require('fs');

var visualRecognition = new VisualRecognitionV3({
  version: '2018-03-19',
  iam_apikey: 'YEDsj2UUdL07fzsng1IWpZW59crwCtRxdvZHwXkFBPfj'
});


app.post('/test',app.upload.single('images_file'),function(req,res){

var images_file= fs.createReadStream(req.file.path);
var threshold = 0.4;

var params = {
  images_file: images_file,
  classifier_ids: ["DefaultCustomModel_1229975198","default"],
  threshold: threshold
};

visualRecognition.classify(params, function(err, response) {
    
    if(err)
        console.log(err);
    else
    {   
        var jsonResponse = JSON.stringify(response, null, 2);
        var parsedRes = JSON.parse(jsonResponse);
        var parsedResClasses = parsedRes.images[0].classifiers[0].classes;
        console.log(parsedResClasses);
        res.send(parsedResClasses);
    }
  });
});
 
 // start server on the specified port and binding host
 app.listen(1234);
 