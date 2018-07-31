$(document).ready(function() {
	// Prevent form submit
	$('#leaderboard-form').on('submit', function(e) {
		e.preventDefault();
	});

	// Handle fetching users on organization change
	$('#organization').on('change', function(e) {
		if (e && e.target && e.target.value) {
			$.get('/api/users/' + e.target.value)
				.done(function(response) {
					if (response && response.users && response.users.length) {
						response.users.sort(sortUsersByEloRating);
						var tableOutput = '';
						for (var i = 0; i < response.users.length; i++) {
							tableOutput += '<tr>' +
									'<td class="rank">' + (i + 1) + '</td>' +
									'<td class="name">' + response.users[i].FirstName + ' ' + response.users[i].LastName + '<span class="username">' + response.users[i].Username + '</span></td>' +
									'<td class="rating">' + response.users[i].EloRating + '</td>' +
									'<td class="gamesPlayed">' + response.users[i].GamesPlayed + '</td>' +
									'<td class="wins">' + response.users[i].Wins + '</td>' +
									'<td class="losses">' + response.users[i].Losses + '</td>' +
								'</tr>';
						}
						$('#leaderboardTable tbody').empty().append(tableOutput);
					} else {
						var noResults = '<tr><td colspan="6" class="noResultsTable">No results found.</td></tr>'
						$('#leaderboardTable tbody').empty().append(noResults);
					}
				})
				.fail(function() {
					var noResults = '<tr><td colspan="6" class="noResultsTable">No results found.</td></tr>'
					$('#leaderboardTable tbody').empty().append(noResults);
				});
		}
	});

	// Sorts by EloRating, then by GamesPlayed, then by Wins, then alphabetically
	function sortUsersByEloRating(userA, userB) {
		if (userA.EloRating > userB.EloRating) {
			return -1;
		} else if (userA.EloRating < userB.EloRating) {
			return 1;
		} else {
			if (userA.GamesPlayed > userB.GamesPlayed) {
				return -1;
			} else if (userA.GamesPlayed < userB.GamesPlayed) {
				return 1;
			} else {
				if (userA.Wins > userB.Wins) {
					return -1;
				} else if (userA.Wins < userB.Wins) {
					return 1;
				} else {
					return userA.FirstName > userB.FirstName;
				}
			}
		}
	}

	// Init
	$('#organization').trigger('change');
});
