$(document).ready(function() {
	$.get('/api/users/Younique')
		.done(function(response) {
			console.log(response);
			if (response && response.users && response.users.length) {
				response.users.sort(function(userA, userB) { return userA.EloRating > userB.EloRating; });
				var tableOutput = '';
				for (var i = 0; i < response.users.length; i++) {
					console.log(response.users[i]);
					console.log(response.users[i].EloRating);
					tableOutput += '<tr>' +
							'<td class="rank">' + (i + 1) + '</td>' +
							'<td class="name">' + response.users[i].FirstName + ' ' + response.users[i].LastName + '</td>' +
							'<td class="rating">' + response.users[i].EloRating + '</td>' +
							'<td class="gamesPlayed">' + response.users[i].GamesPlayed + '</td>' +
							'<td class="wins">' + response.users[i].Wins + '</td>' +
							'<td class="losses">' + response.users[i].Losses + '</td>' +
						'</tr>'
				}
				$('#leaderboardTable tbody').empty().append(tableOutput);
			} else {
				var noResults = '<tr><td colspan="6">No results found.</td></tr>'
				$('#leaderboardTable tbody').empty().append(noResults);
			}
		});

	$('#leaderboard-form').on('submit', function(e) {
		e.preventDefault();
	});
});
