$(document).ready(function() {
	$('#register-form').on('submit', function(e) {
		e.preventDefault();
		$('#passwordHelpBlock').hide().parent().removeClass('has-error');
		$('#usernameHelpBlock').hide().parent().removeClass('has-error');
		
		// Ensure that passwords match
		if ($('#password').val() !== $('#confirmPassword').val()) {
			$('#passwordHelpBlock').show().parent().addClass('has-error');
			return false;
		} else {
			$('#passwordHelpBlock').hide().parent().removeClass('has-error');
		}

		// Data to save
		var jsonData = {
			organization: $('#organization').val(),
			firstName: $('#firstName').val(),
			lastName: $('#lastName').val(),
			username: $('#username').val(),
			password: $('#password').val(),
		};

		// Register the new user
		return $.post('/api/register', jsonData)
			.done(function() {
				window.location.href = '/leaderboard';
			})
			.fail(function(xhr) {
				if (xhr.responseJSON.error === 'Username already exists') {
					$('#usernameHelpBlock').show().parent().addClass('has-error');
				} else {
					$('#usernameHelpBlock').hide().parent().removeClass('has-error');
				}
			});
	});
});
