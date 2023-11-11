var socket = io();

socket.on('info', function (data) {
    document.querySelector('#username').innerHTML = data.username;
    document.querySelector('#email').innerHTML = data.email;
});