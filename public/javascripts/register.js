$(document).ready(function() {
	console.log('ready!');
	var passwordsDoNotMatch = false;

	$('#register-form').on('submit', function(e) {
		e.preventDefault();
		console.log('submitting form');
		console.log(e);
		if ($('#password').val() !== $('#confirmPassword').val()) {
			passwordsDoNotMatch = true;
			return false;
		}
		var jsonData = {
			username: $('#username').val(),
			password: $('#password').val(),
		};
		return $.post('/api/register', jsonData)
			.done(function(response) {
				console.log(response);
				window.location.href = '/leaderboard';
			})
			.fail(function(error) {
				console.log(error);
			});
	});
});