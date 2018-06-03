// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var configDB = require('./config/database.js');

var bodyParser = require('body-parser');

// set up socket.io ============================================================
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// setup routes
	// app.use('/',express.static(__dirname + "/views"));
	app.use('/service',express.static(__dirname + "/app/qms/service"));
	app.use('/customer',express.static(__dirname + "/app/qms/customer"));
	app.use('/display',express.static(__dirname + "/app/qms/display"));
	

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

    app.set('views', __dirname + '/app/qms/service');
	app.set('view engine', 'ejs'); // set up ejs for templating
    
    app.engine('html', require('ejs').renderFile);
	app.set('view engine', 'html');
	// required for passport
	app.use(express.session({ secret: 'QMS-ver7', key: 'sid', cookie: {maxAge: 21600000}})); // session secret with session timeout (3 hrs)
	// app.use(express.session({ secret: 'QMS-ver7', key: 'sid', cookie: {maxAge: 10000}}));
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

	app.use(bodyParser.json());
	app.use(function(req,res,next){
		res.setHeader('Access-Control-Allow-Origin','http://192.168.10.164:3000');
		next();
	})

});

// routes ======================================================================
// require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/app.js')(app, passport,io);

// launch ======================================================================
server.listen(port);
console.log('The magic happens on port ' + port);
