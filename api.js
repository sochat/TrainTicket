const { session, net, nativeImage } = require('electron');
const util = require('./util');
const passport_authuam = 'https://kyfw.12306.cn/passport/web/auth/uamtk';
const passport_appId = 'otn';
const ctx='/otn/';
const passport_authclient = 'uamauthclient';

let api = {
    checkUAM: function () {
        var self = this;        
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
                            self.uampassport(f)
                            .then(resolve, reject);
                        }   
                    });                
                } else {
                    self.uampassport(d).then(resolve, reject);
                }
            });
        });
    },
    uampassport: function (d) {
        return new Promise((resolve, reject) => {
            util.ajax({
                type: "POST",
                url: 'https://kyfw.12306.cn' + ctx + passport_authclient,
                data: {
                    tk: d
                },
                datatype: "json",
                success: function (e) {
                    if (e.result_code == 0) {
                        resolve();
                    }
                },
                error: function (statusMessage) { 
                    reject(statusMessage);
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
                        reject(i.result_message);                        
                    }                    
                },
                error: function (statusMessage) { 
                    reject(statusMessage);
                }
            });
        });
    },
    loadCaptcha: function () {        
        return new Promise((resolve, reject) => {
            var buf = null;
            util.getCookie('https://kyfw.12306.cn/passport').then(cookieString => {
                var req = net.request('https://kyfw.12306.cn/passport/captcha/captcha-image?login_site=E&module=login&rand=sjrand&'
                    + Math.random()).on('response', (res) => {
                    res.on('data', (chunk) => {
                        if (!buf) {
                            buf = Buffer.from(chunk);
                        } else {
                            buf = Buffer.concat([buf, chunk], buf.length + chunk.length);
                        }
                    }).on('end', () => {
                        let img = nativeImage.createFromBuffer(buf);
                        resolve(img.toDataURL());
                    });
                });
                req.setHeader('Cookie', cookieString);
                req.setHeader('Host', 'kyfw.12306.cn');
                req.setHeader('Referer', 'https://kyfw.12306.cn/otn/login/init');
                req.end();
            });
        });      
    },
    login: function (user, pass) {
        var self = this;
        return new Promise((resolve, reject) => {
            util.ajax({
                type: "POST",
                url: 'https://kyfw.12306.cn/passport/web/login',
                data: {
                    username: user,
                    password: pass,
                    appid: 'otn'
                },
                datatype: "json",
                success: function (result) {
                    console.log(result);
                    self.checkUAM().then(() => {
                        resolve();
                    }, (statusMessage) => {
                        reject(statusMessage);
                    });
                },
                error: function (error) {
                    console.log(error);     
                    reject(error);               
                }
            })
        });
    },
    queryOrder: function (start, end) {
        return new Promise((resolve, reject) => {
            util.ajax({
                type: "POST",
                url: 'https://kyfw.12306.cn/otn/queryOrder/queryMyOrder',
                data: {
                    queryType: 2,
                    queryStartDate:start,
                    queryEndDate: end,
                    come_from_flag: 'my_order',
                    pageSize: 80,
                    pageIndex: 0,
                    query_where:'G',
                    sequeue_train_name:''
                },
                datatype: "json",
                success: function (result) {
                    resolve(result);
                },
                error: function (error) {
                    console.log(error);     
                    reject(error);               
                }
            })
        });
        
    }
};
module.exports = api;