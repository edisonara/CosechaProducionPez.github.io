$(document).ready(function() {
    $('#login-form').on('submit', function(event) {
        event.preventDefault();
        
        $.ajax({
            url: '/login',
            type: 'post',
            data: $('#login-form').serialize(),
            success: function(response) {
                $('#message').removeClass().addClass('alert alert-success').text('Login successful! Redirecting...').show();
                setTimeout(function() {
                    window.location.href = response.redirect;
                }, 1000);
            },
            error: function(error) {
                $('#message').removeClass().addClass('alert alert-danger').text('Login failed. Please try again.').show();
            }
        });
    });
});
