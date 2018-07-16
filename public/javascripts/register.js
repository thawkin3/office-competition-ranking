$(document).ready(function() {
	$('#register-form').on('submit', function(e) {
		e.preventDefault();
		if ($('#password').val() !== $('#confirmPassword').val()) {
			$('#passwordHelpBlock').show().parent().addClass('has-error');
			return false;
		} else {
			$('#passwordHelpBlock').hide().parent().removeClass('has-error');
		}

		var jsonData = {
			organization: $('#organization').val(),
			firstName: $('#firstName').val(),
			lastName: $('#lastName').val(),
			username: $('#username').val(),
			password: $('#password').val(),
		};

		return $.post('/api/register', jsonData)
			.done(function(response) {
				window.location.href = '/leaderboard';
			})
			.fail(function(xhr, status, error) {
				if (xhr.responseJSON.error === 'Username already exists') {
					$('#usernameHelpBlock').show().parent().addClass('has-error');
				} else {
					$('#usernameHelpBlock').hide().parent().removeClass('has-error');
				}
			});
	});
});
