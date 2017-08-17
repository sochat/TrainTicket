const {net } = require('electron');
const querystring = require('querystring');

module.exports = {
    ajax: function (params, success, fail) {
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
        if (typeof params.data === 'undefined' || params.data === null) {
            req.end();
        } else {
            req.end(typeof data === "string" ? data : querystring.stringify(data) );
        }
    }
};