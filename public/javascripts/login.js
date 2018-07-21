$(document).ready(function() {
	$('#login-form').on('submit', function(e) {
		e.preventDefault();
		$('#loginErrorHelpBlock').hide();
		$('#username, #password').parent().removeClass('has-error');

		// Data to save
		var jsonData = {
			username: $('#username').val(),
			password: $('#password').val(),
		};

		// Log in the user
		return $.post('/api/login', jsonData)
			.done(function() {
				window.location.href = '/recordGame';
			})
			.fail(function() {
				$('#loginErrorHelpBlock').show();
				$('#username, #password').parent().addClass('has-error');
			});
	});
});
