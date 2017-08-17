const ipc = require('electron').ipcRenderer;

const login = document.getElementById('login');
const captcha = document.getElementById('captcha');
const cw = document.getElementById('captcha-wrapper');
let answer = [];
const Vue = require('./node_modules/vue/dist/vue.common.js');
const VModal = require('vue-js-modal');
Vue.use(VModal.default);
let app = new Vue({
    el: '#app',             
    methods: {
        showLogin: function () {
            this.$modal.show('loginForm');
        },
        login: function () {
            ipc.send('captcha', answer.join(','));
        },
        captcha: function (e) {
            answer.push(e.offsetX);
            answer.push(e.offsetY);
        }
    }
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
