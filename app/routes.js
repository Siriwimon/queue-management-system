// app/routes.js
module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with LOGIN) ========
	// =====================================
	app.get('/service', function(req, res) {
		res.render('index.ejs', { message: req.flash('loginMessage') }); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/service/callback', isLoggedIn, function(req, res) {
		// console.log(req.user)
        res.render('service.html', {
            user : req.user // get the user out of session and pass to template
        });
		
	});

	// process the login form
	app.post('/service/login', passport.authenticate('local-login', {
		successRedirect : '/service/callback', // redirect to the secure profile section
		failureRedirect : '/service', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/service/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/service/signup', passport.authenticate('local-signup', {
		successRedirect : '/service/profile', // redirect to the secure profile section
		failureRedirect : '/service/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// // =====================================
	// // PROFILE SECTION =========================
	// // =====================================
	// // we will want this protected so you have to be logged in to visit
	// // we will use route middleware to verify this (the isLoggedIn function)
	app.get('/service/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/service/logout', function(req, res) {
		req.logout();
		res.redirect('/service');
		res.render('index.ejs', { message: req.flash('loginMessage') }); 
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/service');
}
