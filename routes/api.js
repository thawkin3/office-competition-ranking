/***********************
*** API Requests *******
***********************/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const calculateNewEloRatings = require('../helpers/calculateNewEloRatings');
const auth = require('../helpers/auth');
const passport = require('../auth/passport-config');
const User = require('../models/User');
const Game = require('../models/Game');

// Register a new user
router.post('/register', (req, res, next) => {
	if (req && req.body && (!req.body.organization || !req.body.firstName || !req.body.lastName || !req.body.username || !req.body.password)) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
    const hash = bcrypt.hashSync(req.body.password, 8);
    User.findOne({ Username: req.body.username }, (err, user) => {
        if (err) {
            return next(err);
        } else if (user) {
            return res.status(401).json({ error: 'Username already exists' });
        } else {
        	const newUser = new User({
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
        	newUser.save((err, createdUser) => {
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

// Log in
router.post('/login', passport.authenticate('local', {
	successRedirect: '/recordGame',
}));

// Log out
router.post('/logout', (req, res, next) => {
    req.logout();
    return res.redirect('/');
});

// Get all users
router.get('/users', auth.ensureAuthenticatedForApi, (req, res, next) => {
	User.find({}, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}
		return res.json({ users });
	});
});

// Get all users for a specified organization
router.get('/users/:organization', auth.ensureAuthenticatedForApi, (req, res, next) => {
	if (!req.params.organization) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	User.find({ Organization: req.params.organization }, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}
		return res.json({ users });
	});
});

// Get all users except the user making the request
router.get('/usersExceptMe', auth.ensureAuthenticatedForApi, (req, res, next) => {
	User.find({ Username: { $ne: req.user.Username } }, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}
		return res.json({ users });
	});
});

// Get all users for a specified organization except the user making the request
router.get('/usersExceptMe/:organization', auth.ensureAuthenticatedForApi, (req, res, next) => {
	if (!req.params.organization) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	User.find({ Username: { $ne: req.user.Username }, Organization: req.params.organization }, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}
		return res.json({ users });
	});
});

// Record a new game
router.post('/recordGame', auth.ensureAuthenticatedForApi, (req, res, next) => {
	if (req && req.body && (!req.body.organization || !req.body.opponent || !req.body.winner)) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	const winnerUsername = req.body.winner === 'won' ? req.user.Username : req.body.opponent;
	const loserUsername = req.body.winner === 'won' ? req.body.opponent : req.user.Username;
	const newGame = new Game({
		Organization: req.body.organization,
		Winner: winnerUsername,
		Loser: loserUsername,
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

// Get all recorded games
router.get('/games', auth.ensureAuthenticatedForApi, (req, res, next) => {
	Game.find({}, null, { sort: { DateRecorded: -1 }}, (err, games) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting games' });
		}
		return res.json({ games });
	});
});

// Get all recorded games for an organization
router.get('/games/:organization', auth.ensureAuthenticatedForApi, (req, res, next) => {
	if (!req.params.organization) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	Game.find({ Organization: req.params.organization }, null, { sort: { DateRecorded: -1 }}, (err, games) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting games' });
		}
		return res.json({ games });
	});
});

// Get all recorded games for a user
router.get('/games/:organization/:user', auth.ensureAuthenticatedForApi, (req, res, next) => {
	if (!req.params.organization || !req.params.user) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	Game.find({ Organization: req.params.organization, $or:[{ Winner: req.params.user }, { Loser: req.params.user }] }, null, { sort: { DateRecorded: -1 }}, (err, games) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting games for this user' });
		}
		return res.json({ games });
	});
});

// Validate that the current ratings and data are correct for each user based on the recorded games in the database
router.get('/validateCurrentRatings/:organization', (req, res, next) => {
	if (!req.params.organization) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	User.find({ Organization: req.params.organization }, 'Username FirstName LastName EloRating GamesPlayed Wins Losses', (err, users) => {
		if (err) {
			return res.status(500).json({ error: 'Error getting users' });
		}

		const recordedData = users.reduce((result, user) => ({
			...result,
			[user.Username]: {
				EloRating: user.EloRating,
				GamesPlayed: user.GamesPlayed,
				Wins: user.Wins,
				Losses: user.Losses,
			},
		}), {});

		const calculatedData = users.reduce((result, user) => ({
			...result,
			[user.Username]: {
				EloRating: 1200,
				GamesPlayed: 0,
				Wins: 0,
				Losses: 0,
			},
		}), {});

		Game.find({ Organization: req.params.organization }, null, { sort: { DateRecorded: 1 } }, (err, games) => {
			if (err) {
				return res.status(500).json({ error: 'Error getting games' });
			}

			games.forEach(game => {
				const newRatings = calculateNewEloRatings(calculatedData[game.Winner].EloRating, calculatedData[game.Loser].EloRating);
				calculatedData[game.Winner] = {
					EloRating: newRatings.winnerUserNewRating,
					GamesPlayed: calculatedData[game.Winner].GamesPlayed + 1,
					Wins: calculatedData[game.Winner].Wins + 1,
					Losses: calculatedData[game.Winner].Losses,
				};
				calculatedData[game.Loser] = {
					EloRating: newRatings.loserUserNewRating,
					GamesPlayed: calculatedData[game.Loser].GamesPlayed + 1,
					Wins: calculatedData[game.Loser].Wins,
					Losses: calculatedData[game.Loser].Losses + 1,
				};
			});

			let dataMatchesCorrectly = true;
			for (user in calculatedData) {
				for (key in calculatedData[user]) {
					if (calculatedData[user][key] !== recordedData[user][key]) {
						dataMatchesCorrectly = false;
					}
				}
			}

			if (!dataMatchesCorrectly && req.query.update === 'true') {
				users.forEach(user => {
					user.EloRating = calculatedData[user.Username].EloRating;
					user.GamesPlayed = calculatedData[user.Username].GamesPlayed;
					user.Wins = calculatedData[user.Username].Wins;
					user.Losses = calculatedData[user.Username].Losses;
					user.save((err, savedUser) => {
						if (err) {
							return res.status(500).json({ error: 'Error saving the user: ' + user.Username });
						}
					});
				});
			}

			return res.json({
				recordedData,
				calculatedData,
				dataMatchesCorrectly,
				dataWasUpdated: !dataMatchesCorrectly && req.query.update === 'true',
			});
		});
	});
});

module.exports = router;
