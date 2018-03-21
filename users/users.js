var ALL_USERS =
[
"ajimal",
"guest",
"826372ggdc"
];

exports.is_user = function(user){
    if(ALL_USERS.indexOf(user)==-1)
        return false;
    else
        return true;
};

var crypto = require('crypto');
var DB = require('nosql');
var nosql_admin = DB.load('./users/admin.nosql');

exports.update_password = function(user, pass){
    // console.log("User: " + user + ", Pass: " + pass);
    var salt = genRandomString(16);
    var pw_hash = sha512(pass, salt);
    nosql_admin.modify({ "salt": salt, "password":pw_hash}).make(function(filter) {
        filter.where("user", user);
        filter.callback(function(err, count) {
            console.log('modified documents:', count);
        });
    });
};

exports.auth_admin = function(user,pass,callback){
    nosql_admin.find().make(function(filter) {
        filter.where('user',user);
        filter.callback(function(err, response) {
            if(err){
                // console.log("hit1");
                callback(false);
            }
            else if(response.length==0){
                // console.log("hit2");
                callback(false);
            }
            else{ //user found
                // console.log("<LOG>user:" + user + ", pass:"+pass+"</LOG>");
                var salt = response[0]['salt'];
                var pw_hash = sha512(pass,salt);
                if(pw_hash == response[0]['password']){ //password correct
                    // console.log("hit4");
                    callback(true);
                }
                else{
                    // console.log("Hit5");
                    callback(false);
                }
            }
        });
    });
};

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return value;
};

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,length);   /** return required number of characters */
};