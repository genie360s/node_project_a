/***
 * 
 * 
 * 
 * Library for storing and edititng data
 */

//dependencies
var fs = require('fs');
var path = require('path');

//container for the module (to be exported)

var lib = {};

//base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/');
//write data to a file
lib.create = function(dir,file,data,callback) {
    //open file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            //convert data into a string json objects--> string n viceversa
            var stringData = JSON.stringify(data);

            //write to file and close it
            fs.writeFile(fileDescriptor,stringData,function(err){
                if(!err){
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            });

        } else{
            callback('Could not create new file, it may alreay exist');
        }
    });
};

//read data from the file
lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        callback(err,data);
    });
};

//update data in the file
lib.update = function(dir,file,data,callback){
    //open file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            //convert data into string
            var stringData = JSON.stringify(data);

            //truncate the file
            fs.truncate(fileDescriptor,function(err){
                if(!err){
                    //write to the file and close it
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(err){
                                    callback(false);
                                }else {
                                    callback('Error closing the existing file');
                                }
                            })
                        } else {
                            callback('Error writing to an  existing file')
                        }
                    })
                } else {
                    callback('Error truncating file');
                }
            })
        } else {
            callback('could not open the file for updating, it may not exist yet');
        }
    })
}


//delete a file
lib.delete = function(dir,file,callback){
    //unlink file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false)
        } else {
            callback('Error deleting a file');
        }
    });
};
//export the module
module.exports = lib;