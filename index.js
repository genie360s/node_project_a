// console.log("Hello World !");

// Primary file for the api


// Dependencies

var http = require('http');  //adding the http module
var https = require('https'); //adding https module
var url = require('url'); //adding the url module
var StringDecoder = require('string_decoder').StringDecoder; // adding the stringdecoder module for the payload
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');
var _data = require('./lib/data');

// //testing 
// _data.delete('test','newFile',function(err){
//     console.log('this was an error',err);
// });


//the server should respond to all requests with a string 


//instantiating the http server
var httpServer = http.createServer(function(req,res){
    
    unifiedServer(req,res);

});

//start the server , and have it listen to the configured port

httpServer.listen(config.httpPort,function(){
    console.log("The server is listening on port " + config.httpPort + " in " + config.envName +" mode ");
});

//instantiate https server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')

};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
    
    unifiedServer(req,res);

});
//start https server
httpsServer.listen(config.httpsPort,function(){
    console.log("The server is listening on port " + config.httpsPort + " in " + config.envName +" mode ");
});



//defining a request router

var router = {
    'sample' : handlers.sample,
    'ping' : handlers.ping,
    'users' : handlers.users
};

//all unified server http and https

var unifiedServer = function(req,res){

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
        'payload' : helpers.parseJsonToObject(buffer)
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



};