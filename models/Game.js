var mongoose = require('mongoose');

var gameSchema = new mongoose.Schema({
	Organization: String,
	Winner: String,
	Loser: String,
	RecordedBy: String,
	DateRecorded: Date,
});

var Game = mongoose.model('Game', gameSchema);

module.exports = Game;
