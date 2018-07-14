const passport = require('passport');
const bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

const auth = require('../auth.js');


// Mongoose setup for MongoDB
mongoose.connect('mongodb://localhost/officeCompetitionRankingDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Connected to MongoDB');
	// auth(app, db);
    // indexRouter(app, db);
});

var userSchema = new mongoose.Schema({
	Username: String,
	Password: String,
	EloRating: Number,
	GamesPlayed: Number,
	Wins: Number,
	Losses: Number,
});

var User = mongoose.model('User', userSchema);

// module.exports = function(app, db) {

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
        res.redirect('/leaderboard');
    });

    router.route('/api/logout')
        .get((req, res) => {
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
