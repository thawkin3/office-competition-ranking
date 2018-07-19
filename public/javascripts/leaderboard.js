$(document).ready(function() {
	$.get('/api/games/Younique/Pingpong')
		.done(function(response) {
			console.log(response);
			if (response && response.games && response.games.length) {
				var games = '';
				for (var i = 0; i <= response.games.length; i++) {
					games += '<tr><td class="rank">' + response.games[i].Winner + '</td></tr>'
				}
				$('#leaderboardTable tbody').empty().append(games);
			} else {
				var noResults = '<tr><td colspan="6">No results found.</td></tr>'
				$('#leaderboardTable tbody').empty().append(noResults);
			}
		});

	$('#leaderboard-form').on('submit', function(e) {
		e.preventDefault();
	});
});
