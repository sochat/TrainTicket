const ipc = require('electron').ipcRenderer;
const api = require('./api');
const login = document.getElementById('login');
const captcha = document.getElementById('captcha');
const cw = document.getElementById('captcha-wrapper');
let answer = [];

captcha.addEventListener('load', () => {
    captcha.addEventListener('mouseup', function (e) {
        answer.push(e.offsetX);
        answer.push(e.offsetY);
    });
});

ipc.on('captcha', function (event, success, error) {
    if (success) {
        let user = document.getElementById('username').value;
        let pass = document.getElementById('password').value;
        ipc.send('login', user, pass);
    } else {
        alert(error);
    }
});

ipc.on('login', function (event, success, error) {
    if (success) {
        alert("ok");
    } else {
        alert(error);
    }
});

login.addEventListener('click', function () {
    ipc.send('captcha', answer.join(','));
});