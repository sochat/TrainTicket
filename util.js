const { net, session } = require('electron');
const querystring = require('querystring');
const tough = require('tough-cookie');

module.exports = {
    ajax: function (params, success, fail) {
        var cookiejar = new tough.CookieJar();
        session.defaultSession.cookies.get({}, (error, cookies) => {
            console.log(error, cookies);            
            //cookiejar.getCookieStringSync            
        });  
        if (typeof params.success === 'function') {
            success = params.success;
        }
        if (typeof params.error === 'function') {
            fail = params.error;
        }
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
                    fail(res.statusCode, res.statusMessage);
                }
            });
        });
        req.setHeader('Host', 'kyfw.12306.cn');
        req.setHeader('Referer', 'https://kyfw.12306.cn/otn/login/init');
        
        console.log(req.getHeader('Cookie'));
        if (typeof params.data === 'undefined' || params.data === null) {
            req.end();
        } else {
            let content = typeof params.data === "string" ? params.data : querystring.stringify(params.data); 
            req.end(content);
        }
    }
};