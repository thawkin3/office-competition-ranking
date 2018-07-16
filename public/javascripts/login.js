$(document).ready(function() {
	$('#login-form').on('submit', function(e) {
		e.preventDefault();
		$('#loginErrorHelpBlock').hide();
		$('#username, #password').parent().removeClass('has-error');

		var jsonData = {
			username: $('#username').val(),
			password: $('#password').val(),
		};

		return $.post('/api/login', jsonData)
			.done(function(response) {
				window.location.href = '/recordGame';
			})
			.fail(function(xhr, status, error) {
				$('#loginErrorHelpBlock').show();
				$('#username, #password').parent().addClass('has-error');
			});
	});
});
