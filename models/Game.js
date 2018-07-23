const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
	Organization: String,
	Winner: String,
	Loser: String,
	RecordedBy: String,
	DateRecorded: Date,
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
