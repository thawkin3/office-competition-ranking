$(document).ready(function() {
	$.get('/api/users')
		.done(function(response) {
			if (response && response.users) {
				var selectMenuHtml = '<option disabled selected value>Select a player</option>';
				for (var i = 0; i < response.users.length; i++) {
					selectMenuHtml += '<option value="' + response.users[i].Username + '">' + response.users[i].Username + ' (' + response.users[i].FirstName + ' ' + response.users[i].LastName + ')' + '</option>';
				}
				$('select#playerOne, select#playerTwo').html(selectMenuHtml);
			}
		});

	$('#record-game-form').on('submit', function(e) {
		e.preventDefault();
		if ($('#playOne').val() === $('#playerTwo').val()) {
			$('#playersHelpBlock').show().parent().addClass('has-error');
			return false;
		} else {
			$('#playersHelpBlock').hide().parent().removeClass('has-error');
		}

		var jsonData = {
			organization: $('#organization').val(),
			game: $('#game').val(),
			playerOne: $('#playerOne').val(),
			playerTwo: $('#playerTwo').val(),
			winner: $('#' + $('input[name="winner"]:checked').val()).val(),
		};

		return $.post('/api/recordGame', jsonData)
			.done(function(response) {
				window.location.href = '/leaderboard';
			});
	});
});
