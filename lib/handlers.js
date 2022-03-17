/**
 * 
 * these are request handlers
 */

//  Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./lib/config');
//define handlers
var handlers = {};
//users
handlers.users = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(400);
    }
};

//container for the users submethods
handlers._users = {};

/** 
 * required data: fname, lname,phone, password, tosAgreement
 * optional data:none;
 */

//users-post
handlers._users.post = function (data, callback) {
    //check all required fields are filled
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.firstName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean ' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        //make sure the use doesn't exist
        _data.read('users', phone, function (err, data) {
                if (err) {

                    //hashthepassword
                    var hashedPassword = helpers.hash(password);

                    //create the user object
                    if (hashedPassword) {
                        var userObject = {
                            'firstName': firstName,
                            'lastName': lastName,
                            'phone': phone,
                            'hashedPassword': hashedPassword,
                            'tosAgreement': true
                        };

                        //store user
                        _data.create('users', phone, userObject, function (err) {
                            (!err); {
                                callback(200);
                            }else {
                                console.log(err);
                                callback(500, {
                                    'Error': 'could not create the new use'
                                });
                            } else {
                                callback(500, {'Error' : 'could not hash the user\'s password'}); 
                            }

                        });

                    } else {
                        //user already exists
                        callback(400, {
                            'Error': 'User already exists'
                        });
                    }
                });

        }
        else {
            callback(400, {
                'Error': 'Missing required fields'
            });
        }

    };


};

//users-get
handlers._users.get = function (data, callback) {

};
//users-delete
handlers._users.delete = function (data, callback) {

};


//sample handler

handlers.sample = function (data, callback) {

    //callback a http status code and a payload object
    callback(406, {
        'name': 'application active |handled '
    })

};

//ping handler
handlers.ping = function (data, callback) {
    callback(200);
};

//not found handler

handlers.notFound = function (data, callback) {
    callback(404);

};


//Export the module

module.exports = handlers;