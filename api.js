const { session, net } = require('electron');
const util = require('./util');
const passport_authuam = 'https://kyfw.12306.cn/passport/web/auth/uamtk';
const passport_appId = 'otn';
const ctx='/otn/';
const passport_authclient = 'uamauthclient';

let api = {
    checkUAM: function () {
        return new Promise((resolve, reject) => {
            session.defaultSession.cookies.get({
                url: 'https://kyfw.12306.cn',
                name: "tk"
            }, (error, cookies) => {
                let d = cookies.length > 0 ? cookies[0].value : null;
                if (d == null || d == undefined || d == "") {
                    util.ajax({
                        type: "POST",
                        url: passport_authuam,
                        datatype: "json",
                        data: "appid=" + passport_appId
                    }, function (e) {
                        if (e.result_code == "0") {
                            let f = e.newapptk || e.apptk;
                            this.uampassport(f)
                            .then(resolve, reject);
                        }   
                    });                
                } else {
                    this.uampassport(d).then(resolve, reject);
                }
            });
        });
    },
    uampassport: function (d) {
        return new Promise((resolve, reject) => {
            util.ajax({
                type: "POST",
                url: ctx + passport_authclient,
                data: {
                    tk: d
                },
                datatype: "json",
                success: function (e) {
                    if (e.result_code == 0) {
                        resolve();
                    }
                },
                error: function (statusCode, statusMessage) { 
                    reject(statusCode, statusMessage);
                }
            });
        });
    },
    captcha: function (answer) {
        return new Promise((resolve, reject) => {
            util.ajax({
                type: "POST",
                url: 'https://kyfw.12306.cn/passport/captcha/captcha-check',
                data: {
                    answer: answer, login_site: 'E', rand: 'sjrand'
                },
                datatype: "json",
                success: function (i) {
                    if (i.result_code == "4") {                        
                        resolve();
                    } else {                        
                        reject(i.result_code, i.result_message);                        
                    }                    
                },
                error: function (statusCode, statusMessage) { 
                    reject(statusCode, statusMessage);
                }
            });
        });
    }
};
module.exports = api;