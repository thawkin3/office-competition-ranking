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
	DateRecorded: Date,
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

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
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
    return res.redirect('/');
};

// Helper auth method to ensure that the user is NOT currently logged in
// If they are logged in, redirect to the leaderboard page
function ensureNotAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/leaderboard');
};

// Helper auth method to ensure that the user is currently logged in when making API requests
// If they are not logged in, send an unauthorized error
function ensureAuthenticatedForApi(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'You are currently logged in' });
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
            return res.status(401).json({ error: 'Username already exists' });
        } else {
        	var newUser = new User({
        		Organization: req.body.organization,
        		FirstName: req.body.firstName,
        		LastName: req.body.lastName,
        		Username: req.body.username,
        		Password: hash,
        		EloRating: 1200,
        		GamesPlayed: 0,
        		Wins: 0,
        		Losses: 0,
        	});
        	newUser.save(function(err, createdUser) {
				if (err) {
					return res.status(500).json({ error: 'Error saving new user' });
				}
				return next(null, createdUser);
			});
        }
    });
},
passport.authenticate('local', {
	successRedirect: '/leaderboard',
}));

router.post('/api/login', passport.authenticate('local', {
	successRedirect: '/recordGame',
}));

router.post('/api/logout', (req, res, next) => {
    req.logout();
    return res.redirect('/');
});

router.get('/api/users', ensureAuthenticatedForApi, (req, res, next) => {
	User.find({}, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}
		return res.json({ users: users });
	});
});

router.get('/api/users/:organization', ensureAuthenticatedForApi, (req, res, next) => {
	if (!req.params.organization) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	User.find({ Organization: req.params.organization }, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}
		return res.json({ users: users });
	});
});

router.get('/api/usersExceptMe', ensureAuthenticatedForApi, (req, res, next) => {
	User.find({ Username: { $ne: req.user.Username } }, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}
		return res.json({ users: users });
	});
});

router.get('/api/usersExceptMe/:organization', ensureAuthenticatedForApi, (req, res, next) => {
	if (!req.params.organization) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	User.find({ Username: { $ne: req.user.Username }, Organization: req.params.organization }, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}
		return res.json({ users: users });
	});
});

router.post('/api/recordGame', ensureAuthenticatedForApi, (req, res, next) => {
	if (req && req.body && (!req.body.organization || !req.body.game || !req.body.opponent || !req.body.winner)) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	const winnerUsername = req.body.winner === 'won' ? req.user.Username : req.body.opponent;
	const loserUsername = req.body.winner === 'won' ? req.body.opponent : req.user.Username;
	var newGame = new Game({
		Organization: req.body.organization,
		Game: req.body.game,
		PlayerOne: req.user.Username,
		PlayerTwo: req.body.opponent,
		Winner: winnerUsername,
		RecordedBy: req.user.Username,
		DateRecorded: new Date(),
	});
	newGame.save(function(err, recordedGame) {
		if (err) {
			return res.status(500).json({ error: 'Error saving the game' });
		}

		User.findOne({ Username: winnerUsername }, (err, winnerUser) => {
			if (err) {
				return res.status(500).json({ error: 'Error getting the winner' });
			}

			User.findOne({ Username: loserUsername }, (err, loserUser) => {
				if (err) {
					return res.status(500).json({ error: 'Error getting the loser' });
				}

				const newRatings = calculateNewEloRatings(winnerUser.EloRating, loserUser.EloRating);

				winnerUser.GamesPlayed++;
				winnerUser.Wins++;
				winnerUser.EloRating = newRatings.winnerUserNewRating;

				winnerUser.save((err, updatedWinnerUser) => {
					if (err) {
						return res.status(500).json({ error: 'Error updating the winner' });
					}

					loserUser.GamesPlayed++;
					loserUser.Losses++;
					loserUser.EloRating = newRatings.loserUserNewRating;

					loserUser.save((err, updatedLoserUser) => {
						if (err) {
							return res.status(500).json({ error: 'Error updating the loser' });
						}

						return res.json({
							game: recordedGame,
							winner: updatedWinnerUser,
							loser: updatedLoserUser,
						});
					});
					
				});
			});
		});
	});
});

router.get('/api/games/:organization/:game', ensureAuthenticatedForApi, (req, res, next) => {
	if (!req.params.organization || !req.params.game) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	Game.find({ Organization: req.params.organization, Game: req.params.game }, (err, games) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting games' });
		}
		return res.json({ games: games });
	});
});

// router.use((req, res, next) => {
//     res.status(404)
//         .type('text')
//         .send('Not Found');
// });

/***********************
*** Helper Functions ***
***********************/
// https://en.wikipedia.org/wiki/Elo_rating_system
const calculateNewEloRatings = (winnerUserEloRating, loserUserEloRating) => {
	const kFactor = 32;
	const winnerUserActualScore = 1;
	const loserUserActualScore = 0;
	const winnerUserExpectedScore = 1 / (1 + Math.pow(10, (loserUserEloRating - winnerUserEloRating) / 400));
	const loserUserExpectedScore = 1 / (1 + Math.pow(10, (winnerUserEloRating - loserUserEloRating) / 400));
	const winnerUserNewRating = Math.round(winnerUserEloRating + kFactor * (winnerUserActualScore - winnerUserExpectedScore));
	const loserUserNewRating = Math.round(loserUserEloRating + kFactor * (loserUserActualScore - loserUserExpectedScore));

	return {
		winnerUserNewRating,
		loserUserNewRating,
	};
}

module.exports = router;
