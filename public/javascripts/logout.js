$(document).ready(function() {
	setTimeout(function() {
		$.post('/api/logout')
			.done(function(response) {
				console.log(response);
				window.location.href = '/';
			})
			.fail(function(error) {
				console.log(error);
			});
		}, 1000);
});