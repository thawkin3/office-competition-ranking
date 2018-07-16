const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const session = require('express-session');
const auth = require('../auth.js');

// module.exports = function(app, db) {

	// Mongoose setup for MongoDB
	mongoose.connect('mongodb://localhost/officeCompetitionRankingDB');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
		console.log('Connected to MongoDB');
		// auth(app, db);
	    // indexRouter(app, db);
	});

	// Schemas and Models
	var userSchema = new mongoose.Schema({
		Username: String,
		Password: String,
		EloRating: Number,
		GamesPlayed: Number,
		Wins: Number,
		Losses: Number,
	});

	var User = mongoose.model('User', userSchema);

	// AUTH
	router.use(session({
	    // secret: process.env.SESSION_SECRET,
	    secret: 'mysecret',
	    resave: true,
	    saveUninitialized: true,
	}));
	router.use(passport.initialize());
	router.use(passport.session());

	passport.serializeUser((user, done) => {
	    done(null, user._id);
	});

	passport.deserializeUser((id, done) => {
	    User.findById(id, (err, user) => {
	        done(err, user);
	    });
	});

	passport.use(new LocalStrategy(
	    function(username, password, done) {
	        db.collection('users').findOne({
	            Username: username
	        }, function(err, user) {
	            console.log('User ' + username + ' attempted to log in.');
	            if (err) {
	            	console.log('there was an error authenticating');
	                return done(err);
	            }
	            if (!user) {
	            	console.log('the user was not found');
	                return done(null, false);
	            }
	            if (!bcrypt.compareSync(password, user.Password)) {
	            	console.log('the passwords did not match');
	                return done(null, false);
	            }
	            console.log('success logging in!');
	            return done(null, user);
	        });
	    }
	));
	// END AUTH

	

	// Helper auth method to ensure that the user is currently logged in
	// If they are not logged in, redirect to the home page
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    };

	// Helper auth method to ensure that the user is NOT currently logged in
	// If they are logged in, redirect to the leaderboard page
    function ensureNotAuthenticated(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/leaderboard');
    };

    /***********************
	*** Views **************
    ***********************/
    router.get('/', ensureNotAuthenticated, function(req, res) {
		res.sendFile('index.html', { root:  'public' });
	});

	router.get('/login', ensureNotAuthenticated, function(req, res) {
		res.sendFile('index.html', { root:  'public/login' });
	});

	router.get('/register', ensureNotAuthenticated, function(req, res) {
		console.log('got register page');
		res.sendFile('index.html', { root:  'public/register' });
	});

	router.get('/leaderboard', ensureAuthenticated, function(req, res) {
		res.sendFile('index.html', { root:  'public/leaderboard' });
	});

	router.get('/recordGame', ensureAuthenticated, function(req, res) {
		res.sendFile('index.html', { root:  'public/recordGame' });
	});

	router.get('/logout', ensureAuthenticated, function(req, res) {
		res.sendFile('index.html', { root:  'public/logout' });
	});


	/***********************
	*** API Requests *******
    ***********************/
    router.post('/api/login', passport.authenticate('local', {
        failureRedirect: '/'
    }),
    (req, res) => {
        res.redirect('/leaderboard');
    });

    router.post('/api/register', (req, res, next) => {
    	console.log('inside api/register route');
    	console.log('req.body:', req.body);
        var hash = bcrypt.hashSync(req.body.password, 8);
        console.log('hash:', hash);
        User.findOne({ Username: req.body.username }, function(err, user) {
            if (err) {
            	console.log('error:', err);
                next(err);
            } else if (user) {
            	console.log('found an existing user: ', user);
                res.redirect('/');
            } else {
            	var newUser = new User({
            		Username: req.body.username,
            		Password: hash,
            		EloRating: 400,
            		GamesPlayed: 0,
            		Wins: 0,
            		Losses: 0,
            	});
            	console.log(newUser);
            	newUser.save(function(err, createdUser) {
					if (err) {
						console.log('error in the save:', err);
						res.sendStatus(500);
					}
					console.log(createdUser);
					next(null, createdUser);
				});
            }
        });
    },
    passport.authenticate('local', {
        failureRedirect: '/'
    }),
    (req, res, next) => {
    	console.log('redirecting to leaderboard page');
        res.redirect('/leaderboard');
    });

    router.post('/api/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    // router.use((req, res, next) => {
    //     res.status(404)
    //         .type('text')
    //         .send('Not Found');
    // });

// }

module.exports = router;
