$(document).ready(function() {
	// Record a new game on form submit
	$('#record-game-form').on('submit', function(e) {
		e.preventDefault();

		// Data to save
		var jsonData = {
			organization: $('#organization').val(),
			opponent: $('#opponent').val(),
			winner: $('input[name="winner"]:checked').val(),
		};

		// Record the game
		return $.post('/api/recordGame', jsonData)
			.done(function() {
				window.location.href = '/leaderboard';
			});
	});

	// Handle fetching users on organization change
	$('#organization').on('change', function(e) {
		if (e && e.target && e.target.value) {
			$.get('/api/usersExceptMe/' + e.target.value)
				.done(function(response) {
					if (response && response.users) {
						var selectMenuHtml = '<option disabled selected value>Select an opponent</option>';
						for (var i = 0; i < response.users.length; i++) {
							selectMenuHtml += '<option value="' + response.users[i].Username + '">' + response.users[i].Username + ' (' + response.users[i].FirstName + ' ' + response.users[i].LastName + ')' + '</option>';
						}
						$('select#opponent').html(selectMenuHtml);
					}
				})
				.fail(function() {
					var selectMenuHtml = '<option disabled selected value>Select an opponent</option>';
					$('select#opponent').html(selectMenuHtml);
				});
		}
	});

	// Init
	$('#organization').trigger('change');
});
