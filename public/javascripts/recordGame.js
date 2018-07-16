$(document).ready(function() {
	$.get('/api/usersExceptMe')
		.done(function(response) {
			if (response && response.users) {
				var selectMenuHtml = '<option disabled selected value>Select an opponent</option>';
				for (var i = 0; i < response.users.length; i++) {
					selectMenuHtml += '<option value="' + response.users[i].Username + '">' + response.users[i].Username + ' (' + response.users[i].FirstName + ' ' + response.users[i].LastName + ')' + '</option>';
				}
				$('select#opponent').html(selectMenuHtml);
			}
		});

	$('#record-game-form').on('submit', function(e) {
		e.preventDefault();

		var jsonData = {
			organization: $('#organization').val(),
			game: $('#game').val(),
			opponent: $('#opponent').val(),
			winner: $('input[name="winner"]:checked').val(),
		};

		return $.post('/api/recordGame', jsonData)
			.done(function(response) {
				window.location.href = '/leaderboard';
			});
	});
});
