const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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

const User = mongoose.model('User', userSchema);

module.exports = User;
