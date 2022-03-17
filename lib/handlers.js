/**
 * 
 * these are request handlers
 */

//  Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');
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

    if (firstName && lastName && password && tosAgreement) {
        //check if user exists
        _data.read('users', phone, function (err, data) {
            if (err) {
                //hash the password
                var hashedPassword = helpers.hash(password);

                //create the user
                if (hashedPassword) {

                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    //store the user
                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                'Error': 'A user with the phone number already exists'
                            });
                        }
                    });
                } else {
                    callback(500, {
                        'Error': 'Could not hash the user\'s password'
                    });

                }

            } else {
                //user exists
                callback(400, {
                    'Error': 'user already exists'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required fields'
        });
    }
};
//users-get
//required data:phone
//optional data: none
//only authenticated user  acess only their object
handlers._users.get = function (data, callback) {
    //check validity of the phone number
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        //search for the user
        _data.read('user', phone, function (err, data) {

            if (!err && data) {
                //unhash password , then return to the requester
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {
            'Error': 'missing required field'
        });
    }

};
//users-put
/**
 * required data: phone;
 * optional data: firstName , lastName,password(at least onemust be specified)
 * only authenticated user update his /her own object
 */
handlers._users.put = function (data, callback) {

    //check for the required field
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    //check for the optional fields
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.firstName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    //error if the phone is invalid
    if (phone) {
        //error if nothing is updated
        if (firstName || lastName || password) {
            //search for the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    //update all the fields that are necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    //store the new updates
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {

                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                'Error': 'Could the update the user'
                            });
                        }
                    });

                } else {
                    callback(400, {
                        'Error': 'User does not exist'
                    });
                }
            });

        } else {
            callback(400, {
                'Error': 'Missing fields to update'
            });
        }
    } else {
        callback(400, {
            'Error': 'Missing required field'
        });
    }
};
//users-delete
handlers._users.delete = function (data, callback) {

    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        //search for the user
        _data.read('user', phone, function (err, data) {

            if (!err && data) {
                _data.delete('users', phone, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            'Error': 'could not delete the specified user'
                        });
                    }

                });
            } else {
                callback(400, {
                    'Error': 'specified user absent'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'missing required field'
        });
    }

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