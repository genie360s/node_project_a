// console.log("Hello World !");

// Primary file for the api


// Dependencies

var http = require('http');  //adding the http module
var url = require('url'); //adding the url module
var StringDecoder = require('string_decoder').StringDecoder; // adding the stringdecoder module for the payload
var config = require('./lib/config');
//the server should respond to all requests with a string 

var server = http.createServer(function(req,res){
    
    //get url and parse it
var parsedUrl = url.parse(req.url,true);

//get the path

var path = parsedUrl.pathname;
var trimmedPath = path.replace(/^\/+|\/+$/g,''); //regex

//get the querry string as an object

var queryStringObject = parsedUrl.query;

//get the http method
var method = req.method.toLowerCase();

//get the headers as an object

var headers = req.headers;

//get the payloads ..will require string decoder

var decoder = new StringDecoder('utf-8'); //decodes data that's in the utf-8
var buffer = '';  //holds the data temporary
req.on('data', function(data){//emits the data
    buffer + decoder.write(data); //appends the decode data
});

req.on('end',function(){
    buffer += decoder.end();


    //choose handler , directing the request, if not found use not found handler

    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;



    //construct the data object to send to the handler
    var data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : buffer
    };

//route the request to the specified handler
     chosenHandler(data, function(statusCode,payload){

        //use the status code called back by the handler, or the default to 200

        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        //use the payload called back by the handler, or default to 400
        payload = typeof(payload) == 'object' ? payload : {};

        //converting to a string

        var payloadString = JSON.stringify(payload);

        //return the response
        res.setHeader('Content-Type','application/json');
        res.writeHead(statusCode);

        res.end('the server is online |' + payloadString + 'request received\n');

//logging payload string

console.log('Returning this response:',statusCode,payloadString);

console.log('Request received on path: '+ trimmedPath+ ' with method '+ method + 'and with these query string parameters\n' , queryStringObject);

//logging headers

console.log('Request received with these headers', headers);

//logging buffers

console.log('Request received with this payload:',buffer);
 
     });
    
});



});

//start the server , and have it listen to the configured port

server.listen(config.port,function(){
    console.log("The server is listening on port " + config.port + " in " + config.envName +" mode ");
});


//define handlers
var handlers = {};

//sample handler

handlers.sample = function(data,callback) {

    //callback a http status code and a payload object
    callback(406,{'name' : 'application active |handled '})

};

//not found handler

handlers.notFound = function(data,callback){
    callback(404);

};
//defining a request router

var router = {
    'sample' : handlers.sample
};

//all unified server http and https
