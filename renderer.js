const ipc = require('electron').ipcRenderer;

const login = document.getElementById('login');
const captcha = document.getElementById('captcha');
const cw = document.getElementById('captcha-wrapper');
let answer = [];
//const Vue = require('./node_modules/vue/dist/vue.common.js');
const VModal = require('vue-js-modal');
Vue.use(VModal.default);


const routes = [
    { path: '/cal', component: calendar }
   // { path: '/bar', component: Bar }
];

const router = new VueRouter({
    routes 
});

let app = new Vue({
    router,
    el: '#app',    
    data: {
        captchaSrc: '',
        enabled: false,
        username: 'sochat',
        password: 'Symbian_3'
    },         
    methods: {
        showLogin: function () {
            this.$modal.show('loginForm');
            ipc.send('init');
            var self = this;
            ipc.on('init', function (event, params) {
                /*params.forEach(function(element) {
                    document.cookie = element;                    
                });
                self.captchaSrc = 'https://kyfw.12306.cn/passport/captcha/captcha-image?login_site=E&module=login&rand=sjrand&'
                    + Math.random();
                */
                ipc.send('loadCaptcha');
            });
            ipc.on('loadCaptcha', function (event, url) {                
                self.captchaSrc = url;
                self.enabled = true;
                answer = [];
            });
            ipc.on('captcha', function (event, success, error) {
                if (success) {                    
                    ipc.send('login', self.username, self.password);
                } else {
                    alert(error);
                }
            });
            ipc.on('login', function (event, success, error) {
                if (success) {
                    self.$modal.hide('loginForm');
                } else {
                    alert(error);
                }
            });
        },
        login: function () {
            ipc.send('captcha', answer.join(','));
        },
        captcha: function (e) {
            answer.push(e.offsetX);
            answer.push(e.offsetY);
        },
        reload: function () {
            ipc.send('loadCaptcha');
        }
    }
});


