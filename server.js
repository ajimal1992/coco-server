//Config
var config = require('./config/config');

//setup http express server
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

app.use(bodyParser.json()); //use json parser

//specify the resource folders (js and CSS)
app.use('/favicon.ico', express.static(path.join(__dirname, config.FAVICON_PATH)));
app.use('/',express.static(path.join(__dirname, config.SITE_DIR))); 

var server = require('http').createServer(app); 

//Helmet Securing
var helmet = require('helmet');
app.use(helmet());

//start server
server.listen(config.PORT, function() {
    console.log('Server listening at port %d', config.PORT);
});


//-----------------------------------controllers-----------------------------------------------//


//home controller 
app.get(config.HOME_ROUTE, function (req, res) {
	renderView(res,config.HOME_FN);
});

//other controllers...
//app.get/post...

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
