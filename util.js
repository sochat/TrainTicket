const { net, session } = require('electron');
const querystring = require('querystring');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;

module.exports = {
    ajax: function (params, success, fail) {        
        if (typeof params.success === 'function') {
            success = params.success;
        }
        if (typeof params.error === 'function') {
            fail = params.error;
        }
        this.getCookie().then((cookieString) => {
            let req = net.request({
                url: params.url,
                method: params.type || "GET"
            }).on('response', (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    if (response.statusCode == 200) {
                        if (typeof success !== 'function') {
                            return;
                        }
                        if (params.datatype === "json") {
                            success(JSON.parse(data));
                        } else {
                            success(data);
                        }
                    } else {
                        if (typeof fail !== 'function') {
                            return;
                        }
                        fail(res.statusMessage);
                    }
                });
            });
            req.setHeader('Host', 'kyfw.12306.cn');
            req.setHeader('Referer', 'https://kyfw.12306.cn/otn/login/init');
            req.setHeader('Cookie', cookieString);
            if (typeof params.data === 'undefined' || params.data === null) {
                req.end();
            } else {
                let content = typeof params.data === "string" ? params.data : querystring.stringify(params.data);
                req.end(content);
            }
        });
    },
    getCookie: function () {
        return new Promise((resolve, reject) => {
            var cookiejar = new tough.CookieJar();
            session.defaultSession.cookies.get({}, (error, cookies) => {
                console.log(error, cookies);
                cookies.forEach(function (cookie) {
                    cookiejar.setCookie(Cookie({
                        key: cookie.name,
                        value: cookie.value,
    
                    }));
                });
                var cookieString = cookiejar.getCookieStringSync();
                resolve(cookieString);
            });        
        });
    }
};