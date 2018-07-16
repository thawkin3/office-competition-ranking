const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const session = require('express-session');

/***********************
*** Mongoose ***********
***********************/
mongoose.connect('mongodb://localhost/officeCompetitionRankingDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Connected to MongoDB');
});

/***********************
*** Schemas and Models *
***********************/
var userSchema = new mongoose.Schema({
	Username: String,
	Password: String,
	FirstName: String,
	LastName: String,
	Organization: String,
	EloRating: Number,
	GamesPlayed: Number,
	Wins: Number,
	Losses: Number,
});

var User = mongoose.model('User', userSchema);

var gameSchema = new mongoose.Schema({
	Organization: String,
	Game: String,
	PlayerOne: String,
	PlayerTwo: String,
	Winner: String,
	RecordedBy: String,
});

var Game = mongoose.model('Game', gameSchema);

/***********************
*** Authentication *****
***********************/
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
        User.findOne({ Username: username }, function(err, user) {
            console.log('User ' + username + ' attempted to log in.');
            if (err) {
            	console.log('there was an error authenticating');
                return done(err);
            }
            if (!user) {
            	console.log('the user was not found');
                return done(null, false, { message: 'Username or password is incorrect' });
            }
            if (!bcrypt.compareSync(password, user.Password)) {
            	console.log('the passwords did not match');
                return done(null, false, { message: 'Username or password is incorrect' });
            }
            console.log('success logging in!');
            return done(null, user);
        });
    }
));

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

// Helper auth method to ensure that the user is currently logged in when making API requests
// If they are not logged in, send an unauthorized error
function ensureAuthenticatedForApi(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'You are currently logged in' });
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
router.post('/api/register', (req, res, next) => {
    var hash = bcrypt.hashSync(req.body.password, 8);
    User.findOne({ Username: req.body.username }, function(err, user) {
        if (err) {
            next(err);
        } else if (user) {
            res.status(401).json({ error: 'Username already exists' });
        } else {
        	var newUser = new User({
        		Organization: req.body.organization,
        		FirstName: req.body.firstName,
        		LastName: req.body.lastName,
        		Username: req.body.username,
        		Password: hash,
        		EloRating: 400,
        		GamesPlayed: 0,
        		Wins: 0,
        		Losses: 0,
        	});
        	newUser.save(function(err, createdUser) {
				if (err) {
					res.status(500).json({ error: 'Error saving new user' });
				}
				next(null, createdUser);
			});
        }
    });
},
passport.authenticate('local', {
	successRedirect: '/recordGame',
}));

router.post('/api/login', passport.authenticate('local', {
	successRedirect: '/recordGame',
}));

router.post('/api/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.get('/api/users', ensureAuthenticatedForApi, (req, res, next) => {
	User.find({}, 'Username FirstName LastName', (err, users) => {
		if (err) {
			res.status(500).json({ error: 'Error getting users' });
		}
		res.json({ users: users });
	});
});

router.get('/api/usersExceptMe', ensureAuthenticatedForApi, (req, res, next) => {
	User.find({ Username: { $ne: req.user.Username } }, 'Username FirstName LastName', (err, users) => {
		if (err) {
			res.status(500).json({ error: 'Error getting users' });
		}
		res.json({ users: users });
	});
});

router.post('/api/recordGame', ensureAuthenticatedForApi, (req, res, next) => {
	if (req && req.body && (!req.body.organization || !req.body.game || !req.body.opponent || !req.body.winner)) {
		res.status(400).json({ error: 'Required fields are missing' });
	}
	var newGame = new Game({
		Organization: req.body.organization,
		Game: req.body.game,
		PlayerOne: req.user.Username,
		PlayerTwo: req.body.opponent,
		Winner: req.body.winner === 'won' ? req.user.Username : req.body.opponent,
		RecordedBy: req.user.Username,
	});
	newGame.save(function(err, recordedGame) {
		if (err) {
			res.status(500).json({ error: 'Error saving the game' });
		}
		res.json(recordedGame);
	});
});

// router.use((req, res, next) => {
//     res.status(404)
//         .type('text')
//         .send('Not Found');
// });

module.exports = router;
