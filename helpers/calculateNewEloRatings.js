// Calculate the Elo rating for the winner and loser of a game based on their current ratings
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

module.exports = calculateNewEloRatings;
