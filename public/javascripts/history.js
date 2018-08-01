$(document).ready(function() {
	// Prevent form submit
	$('#history-form').on('submit', function(e) {
		e.preventDefault();
	});

	// Add player username when page loads
	var username = window.location.pathname.replace('/history/', '');
	$('#playerName').text('for ' + username);

	// Handle fetching users on organization change
	$('#organization').on('change', function(e) {
		if (e && e.target && e.target.value) {
			$.get('/api/games/' + e.target.value + '/' + username)
				.done(function(response) {
					if (response && response.games && response.games.length) {
						var tableOutput = '';
						var won = 0;
						var lost = 0;
						var played = response.games.length;
						for (var i = 0; i < played; i++) {
							var playerWonThisGame = username === response.games[i].Winner;
							if (playerWonThisGame) {
								won++;
							} else {
								lost++;
							}
							tableOutput += '<tr>' +
									'<td class="date">' + response.games[i].DateRecorded.replace(/T.*$/, '') + '</td>' +
									'<td class="opponent">' + (playerWonThisGame ? response.games[i].Loser : response.games[i].Winner) + '</td>' +
									'<td class="outcome">' + (playerWonThisGame ? 'W' : 'L') + '</td>' +
								'</tr>';
						}
						$('.stat.won').text(won);
						$('.stat.lost').text(lost);
						$('.stat.played').text(played);
						$('#gameHistoryTable tbody').empty().append(tableOutput);
					} else {
						var noResults = '<tr><td colspan="6" class="noResultsTable">This player hasn\'t played any games yet.</td></tr>'
						$('#gameHistoryTable tbody').empty().append(noResults);
					}
				})
				.fail(function() {
					var noResults = '<tr><td colspan="6" class="noResultsTable">Oops! There was an error fetching the results.</td></tr>'
					$('#gameHistoryTable tbody').empty().append(noResults);
				});
		}
	});

	// Init
	$('#organization').trigger('change');
});
