//Config
var config = require('./config/config');

//setup http express server
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

//filesystem
var fs = require('fs');

//users
var users = require('./users/users.js');

//nosql
var DB = require('nosql');

//var nosql = DB.load('db/database.nosql');
var nosql_staging2 = DB.load('images/staging.nosql');
var nosql_config = DB.load('config/config.nosql'); 

// nosql.insert({id:3}, true).where("id",3);
// nosql.insert({id:3});
// nosql.insert({ approved: {test2:"test2"} });
// nosql.update({ id: 2, name:"ajimal"}).make(function(builder) {
//     // builder.first(); --> updates only one document
//     builder.where('id', 2);
//     builder.callback(function(err, count) {
//         console.log('updated documents:', count);
//     });
// });
// nosql.modify({ name: "onewhosight" }).make(function(builder) {
//     // builder.first(); --> modifies only one document
//     builder.where('id', 2);
//     builder.callback(function(err, count) {
//         console.log('modified documents:', count);
//     });
// });
// nosql.remove().make(function(builder) {
//     // builder.first(); --> removes only one document
//     builder.where("id", 2);
//     builder.callback(function(err, count) {
//         console.log('removed documents:', count);
//     });
// });

//test count
// nosql_staging.count().make(function(filter) {
//     filter.where('user', "ajimal");
//     filter.callback(function(err, count) {
//         console.log("Error: " + err + ", Count: " + count);
//     });
// });
//end test count


app.use(bodyParser.json()); //use json parser
app.use(bodyParser.urlencoded({ extended: true }));
//specify the resource folders (js and CSS)
app.use('/favicon.ico', express.static(path.join(__dirname, config.FAVICON_PATH)));
app.use('/image_pool',express.static(path.join(__dirname, "images", "image_pool"))); 
app.use('/image_staging',express.static(path.join(__dirname, "images", "image_staging"))); 
app.use('/image_approved',express.static(path.join(__dirname, "images", "image_approved"))); 
app.use('/',express.static(path.join(__dirname, config.SITE_DIR))); 

//sessions
var session = require('express-session');
app.use(session({
    secret: "53CRE7",
    name: 'session',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60*60*1000
    }
}))

var server = require('http').createServer(app); 

//Helmet Securing
var helmet = require('helmet');
app.use(helmet());

//start server
server.listen(config.PORT, function() {
    console.log('Server listening at port %d', config.PORT);
});

// nosql_staging2.one().make(function(filter){
//     filter.where("state","AWAITING");
//     filter.callback(function(err, response){
//         console.log(response);
//     });
// });

//initialize nosql file
var sizeOf = require('image-size');
nosql_staging2.count().make(function(filter) {
    filter.callback(function(err, count) {
        if(count!=0) //no sql file not empty. Dont need to initialize
            return;
        nosql_config.find().make(function(filter){
            filter.callback(function(err,response){
                var class_name = response[0]["class"][0];
                fs.readdir("./images/image_pool", (err, files) => {
                    for(var i=0; i<files.length; i++){
                        var dimensions = sizeOf('images/image_pool/' + files[i]);
                        // console.log(files[i],dimensions.width, dimensions.height);
                        nosql_staging2.insert({"user":"", "polys": [], "image":files[i], "state":"AWAITING", "class":class_name, "width":dimensions.width,"height":dimensions.height});
                    }
                });
            });
        });
        //reset curr_index on config
        nosql_config.modify({"curr_index":0});
    });
});

// nosql_staging2.insert({"test":"test"}).callback(function(err,count){
//     console.log(count);
// });
// nosql_staging2.modify({"user":"ajimal"}).where("state","LOL").where("class","MEH");
//-----------------------------------controllers-----------------------------------------------//

//home controller 
app.get(config.HOME_ROUTE, function (req, res) {
	renderView(res,config.HOME_FN);
});

//login get
app.get(config.LOGIN_ROUTE, function (req,res){
    renderView(res,config.LOGIN_FN);
});

//login post
app.post(config.LOGIN_ROUTE, function (req, res) {
    var input_un = escape(req.body.login.user);
    var input_pw = escape(req.body.login.pass);
    //req.session.state = config.STATE_LOGIN;
    // users.update_password(input_un,input_pw);
    users.auth_admin(input_un,input_pw,function(success){
        if(success){
            // req.session.touch();
            req.sessionStore.clear(function(error){
                if(error){
                    res.redirect(config.LOGIN_ROUTE+"?error=e06");
                }
                else{
            req.session.username = input_un;
            req.session.state = 1;
            res.redirect(config.ADMIN_ROUTE);
        }
            });
        }
        else{
            //clearSession(req);
            res.redirect(config.LOGIN_ROUTE+"?error=e01");
        }
    });
});

//admin page
app.get(config.ADMIN_ROUTE, function (req,res){
    authorized(req,res,function(){
        renderView(res,config.ADMIN_FN);    
    });
});

//update poly data
app.post("/update-image", function(req, res){
    //console.log(req.body);
    var user = escape(req.body.user);
    var polys = req.body.polys;
    var image = req.body.image;
    var class_name = req.body.class;
    var get_image = req.body.get_image;
    // console.log(get_image);

    if(!image || !polys || !user){
        res.status(400);
        res.json({user:""});
        return;
    }

    nosql_staging2.modify({"polys":polys,state:"COMPLETED"}).make(function(filter) {
    // builder.first(); --> updates only one document
        filter.where('image', image);
        filter.where('class', class_name)
        filter.callback(function(err, count) {
            if(err){
                res.status(500);
                res.send("Sorry, internal error");
                return;
            }
            if(get_image=="no"){
                // console.log("hit1");
                res.status(200);
                res.json({"image":"","class":""});
                return;
            }
            // console.log("hit2");
            res.redirect("/get-image/" + user);
        });
    });
});

//pull image from staging or pool
app.get("/get-image/:user", function(req, res){
    var json = {};
    var user = escape(req.params.user); 

    if(!users.is_user(user)){
        json['user'] = "";
        res.status(404);
        res.json(json);
        return;
    }

    //user available
    json['user'] = user;
    //before get image, check if user has already pulled image in staging
    nosql_staging2.find().make(function(filter) {
        filter.where('user',user);
        filter.or();
        filter.where('state','PULLED');
        filter.where('state','REJECTED');
        filter.end();
        filter.callback(function(err, response) {
            if(err){
                res.status(500);
                res.send("Sorry server is facing some technical issue. Please try again later");
                return;
            }

            if(response.length==0){ //get new image
                nosql_staging2.one().make(function(filter){
                    filter.where("state","AWAITING");
                    filter.callback(function(err, response){
                        if(!response){
                            // json["image"] = "";
                            // res.status(200);
                            // res.json(json);
                            // //@aji back here when you want to go to the next class.
                            // //...
                            // return;

                            // console.log("no Image in pool");
                            nosql_config.one().make(function(filter){
                                filter.callback(function(err, response){
                                    var class_list = response['class'];
                                    var curr_index = response['curr_index'];
                                    // console.log(class_list);
                                    // console.log(curr_index);
                                    if(class_list.length-1 <= curr_index){
                                        json["image"] = "";
                                        res.status(200);
                                        res.json(json);
                                        return;
                                    }
                                    else{
                                        nosql_config.modify({"curr_index":curr_index+1});
                                        var class_name = response["class"][curr_index+1];
                                        fs.readdir("./images/image_pool", (err, files) => {
                                            if(files.length==0){
                                                json["image"] = "";
                                                res.status(200);
                                                res.json(json);
                                                return;
                                            }
                                            for(var i=0; i<files.length; i++){
                                                var dimensions = sizeOf('images/image_pool/' + files[i]);
                                                // console.log(files[i],dimensions.width, dimensions.height);
                                                if( i==0){ //reply request first.
                                                    nosql_staging2.insert({"user":"", "polys": [], "image":files[i], "state":"AWAITING", "class":class_name, "width":dimensions.width,"height":dimensions.height}).callback(function(err,count){
                                                        res.redirect("/get-image/" + user);
                                                    });
                                                }
                                                else{
                                                    nosql_staging2.insert({"user":"", "polys": [], "image":files[i], "state":"AWAITING", "class":class_name, "width":dimensions.width,"height":dimensions.height});
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                            return;
                        }
                        json["image"] = response["image"];
                        json["class"] = response["class"];
                        nosql_staging2.modify({"user":user,"state":"PULLED"}).where("image",response["image"]).where("class",response["class"]);
                        res.status(200);
                        res.json(json);
                    });
                });
            }
            else{ //get pull_image
                json["image"] = response[0]["image"];
                json["class"] = response[0]["class"];
                res.status(200);
                res.json(json);
            }
        });
    });
});

//get completed imaged
app.get("/get-completed-image",function(req, res){
    authorized(req,res,function(){
        nosql_staging2.find().make(function(filter) {
            filter.where('state', 'COMPLETED');
            filter.callback(function(err, response) {
                if(err){
                    res.status(500);
                    res.send("Sorry server is facing some technical issue. Please try again later");
                    return;
                }
                var json = {};
                if(response.length==0){ //get image from image_pool
                    json["user"] = "";
                    json["image"] = "";
                    res.status(200);
                    res.json(json);
                }
                else{ //get completed_image //TODO: @aji there might be a problem when 2 admins grab an image at the same time.
                    json["user"] = response[0]["user"];
                    json["image"] = response[0]["image"];
                    json["polys"] = response[0]["polys"];
                    json["class"] = response[0]["class"];
                    res.status(200);
                    res.json(json);
                }
            });
        });
    });
});

app.post("/approve-image", function(req,res){
    authorized(req,res,function(){
        var image = req.body.image;
        var approved = req.body.approved;
        var class_name = req.body.class;
        var json = {};

        if(!image || !approved){
            res.status(400);
            res.json({user:""});
            return;
        }

        nosql_staging2.find().make(function(filter) {
            filter.where('image', image);
            filter.where('class',class_name);
            filter.callback(function(err, response) {
                if(err){
                    res.status(500);
                    res.send("Sorry server is facing some technical issue. Please try again later");
                    return;
                }
    
                if(response.length==0){ 
                    json["image"] = "";
                    res.status(404);
                    res.json(json);
                }
                else{ //update image with approval
                    var end_state = "REJECTED";
                    if(approved == "yes"){
                        end_state = "APPROVED";
                    }
                    nosql_staging2.modify({state:end_state}).make(function(filter) {
                    // builder.first(); --> updates only one document
                        filter.where('image', image);
                        filter.where('class', class_name)
                        filter.callback(function(err, count) {
                            if(err){
                                res.status(500);
                                res.send("Sorry, internal error");
                                return;
                            }
                            res.redirect("/get-completed-image");
                        });
                    });
                }
            });
        });
    });
});

app.get("/get-stats/:user", function(req,res){
    var json = {};
    var user = escape(req.params.user); 
    if(!users.is_user(user) && (user!="13373")){ //TODO: Fix quick fix
        json['user'] = "";
        res.status(404);
        res.json(json);
        return;
    }

    //user available
    json['user'] = user;

    nosql_staging2.find().make(function(filter) {
        if(user!="13373") //TODO: Fix quick fix
            filter.where('user', user);
        filter.callback(function(err, response) {
            if(err){
                res.status(500);
                res.send("Sorry, internal error");
                return;
            }
            if(response.length==0){
                json['stats'] = ""; 
                res.status(200);
                res.json(json);
                return;
            }
            var approved_count = 0;
            var rejected_count = 0;
            var pulled_count = 0;
            var pending_count = 0;
            var awaiting_count = 0;

            for(var i=0; i<response.length; i++){
                if(response[i]['state'] == "PULLED")
                    ++pulled_count;
                else if(response[i]['state'] == "APPROVED")
                    ++approved_count;
                else if(response[i]['state'] == "REJECTED")
                    ++rejected_count;
                else if(response[i]['state'] == "COMPLETED")
                    ++pending_count;
                else if(response[i]['state'] == "AWAITING")
                    ++awaiting_count;
            }

            json['stats'] = {
                "approved": approved_count,
                "pending": pending_count,
                "rejected": rejected_count,
                "balance" : pulled_count+awaiting_count
            };

            res.status(200);
            res.json(json);

        });
    });
    
});

app.get("/get-json", function(req, res){
    authorized(req,res,function(){
        nosql_staging2.find().make(function(filter) {
            filter.where('state', "APPROVED");
            filter.callback(function(err, response) {
                var json = {};
                var json_list = [];
                for(var i=0; i<response.length; i++){
                    var tmp_json = {};
                    var polys = response[i]["polys"];
                    //denormalize polys
                    for(var x=0; x<polys.length; x++){
                        var poly = polys[x];
                        for(var z=0; z<poly.length; z++){
                            if(z%2){ //odd
                                poly[z] = poly[z] * response[i]['height'];
                            }
                            else{
                                poly[z] = poly[z] * response[i]['width'];
                            }
                        }
                    }
                    tmp_json[response[i]["class"]] = polys;
                    tmp_json["image"] = response[i]["image"];
                    tmp_json["user"] = response[i]["user"];
                    json_list.push(tmp_json);
                }
                json["data"] = json_list;
                if(response.length==0){
                    json["data"] = "No data";
                }
                var json_stringified = JSON.stringify(json, null, 2);
                var filename = 'data.json';
                var mimetype = 'application/json';
                res.setHeader('Content-Type', mimetype);
                res.setHeader('Content-disposition','attachment; filename='+filename);
                res.status(200);
                res.send( json_stringified );
            });
        });
    });
});

//route to home on get root
app.get("/config", function(req, res){
    authorized(req,res,function(){
        renderView(res,"coco_change_pwd.html");
    });
});

app.post("/config", function(req, res){
    authorized(req,res,function(){
        var curr_pwd = escape(req.body.curr_pwd);
        var new_pwd = escape(req.body.new_pwd);
        // console.log(req.session.username);
        users.auth_admin(req.session.username,curr_pwd,function(success){
            if(success){
                // console.log("success");
                users.update_password(req.session.username,new_pwd);
                res.status(200);
                res.json({"login":true});
            }
            else{
                //clearSession(req);
                res.status(400);
                res.json({"login":false});
            }
        });
    });
});

app.get("/get-config-info", function(req, res){
    authorized(req,res,function(){
        nosql_config.one().make(function(filter){
            filter.callback(function(err,response){
                var class_list = response['class'];
                var json  = {"classes":class_list.join()};
                res.status(200);
                res.json(json);
            });
        });
    });
});

app.post("/get-config-info", function(req, res){
    authorized(req,res,function(){
        var classes = req.body.classes.split(",");
        nosql_config.modify({"class":classes});
        res.status(200);
        res.json({"request":"success"});
    });
});

app.get("/clear", function(req,res){
    authorized(req,res,function(){
        nosql_config.modify({"curr_index":0});
        res.status(200);
        res.json({"request":"success"});
        nosql_staging2.remove().callback(function(err,count){
            nosql_staging2.count().make(function(filter) {
                filter.callback(function(err, count) {
                    if(count!=0) //no sql file not empty. Dont need to initialize
                        return;
                    nosql_config.find().make(function(filter){
                        filter.callback(function(err,response){
                            var class_name = response[0]["class"][0];
                            fs.readdir("./images/image_pool", (err, files) => {
                                for(var i=0; i<files.length; i++){
                                    var dimensions = sizeOf('images/image_pool/' + files[i]);
                                    // console.log(files[i],dimensions.width, dimensions.height);
                                    nosql_staging2.insert({"user":"", "polys": [], "image":files[i], "state":"AWAITING", "class":class_name, "width":dimensions.width,"height":dimensions.height});
                                }
                            });
                        });
                    });
                    //reset curr_index on config
                    nosql_config.modify({"curr_index":0});
                });
            });
        });
    });
});

app.get("/logout", function(req, res){
    req.session.destroy();
    res.status("200");
    res.send("ok");
});

//route to home on get root
app.get("/", function(req, res){
    res.redirect(config.HOME_ROUTE);
});

//catch other routes (must be the end of all other routes)
app.get("*", function(req, res){
    res.status(404)
    renderView(res,config.ERROR_404_FN);
});

//You define error-handling middleware last, after other app.use() and routes calls
app.use(function(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    console.error(err.stack)
    res.status(500)
    renderView(res,config.ERROR_FAILURE_FN);
});
  
//render view
function renderView(res,FILE){
	res.sendFile(path.join(__dirname,config.SITE_DIR,FILE));
}

// function clearSession(req) {
//     req.session.username = null;
//     req.session.state = null;
// }

function authorized(req,res,callback){
    //console.log(req);
    // console.log("REQUEST: " + req.url);
    // console.log("SESSIONID: " + req.sessionID);
    // console.log("===========SESSIONS=============");
    // console.log(req.sessionStore.sessions);
    // console.log("================================");
    if (req.session.state === 1) {
        callback();
    }
    else{
        req.session.destroy();
        res.redirect(config.LOGIN_ROUTE+"?error=e02");
    }
}
