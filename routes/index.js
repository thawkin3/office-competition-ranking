const passport = require('passport');
const bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();

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
        var hash = bcrypt.hashSync(req.body.password, 8);
        db.collection('users').findOne({
            username: req.body.username
        }, function(err, user) {
            if (err) {
                next(err);
            } else if (user) {
                res.redirect('/');
            } else {
                db.collection('users').insertOne({
                        username: req.body.username,
                        password: hash
                    },
                    (err, doc) => {
                        if (err) {
                            res.redirect('/');
                        } else {
                            next(null, user);
                        }
                    }
                )
            }
        })
    },
    passport.authenticate('local', {
        failureRedirect: '/'
    }),
    (req, res, next) => {
        res.redirect('/profile');
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
