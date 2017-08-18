const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const ipc = electron.ipcMain;
const net = electron.net;
const api = require('./api');

let mainWindow;

app.commandLine.appendSwitch('ignore-certificate-errors');
app.on("ready", function () {
    mainWindow = new BrowserWindow({width: 800, height: 600, 
        title: '火车票',
        webPreferences: {allowRunningInsecureContent: true}
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    //mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.includes('12306.cn')) {
    // Verification logic.
    event.preventDefault()
    callback(true)
  } else {
    callback(false)
  }
});

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {
    app.quit();
  //}
});

ipc.on('init', function (event) {
    net.request('https://kyfw.12306.cn/otn/login/init')
        .on('response', (res) => {
            console.log(res.headers);
            /*res.headers['set-cookie'].forEach(function (element) {
                let arr = element.split(/[=;]/);                
                mainWindow.webContents.session.cookies.set({
                    url: 'https://kyfw.12306.cn' + arr[3], name: arr[0], value: arr[1]
                }, (error) => {
                    if (error) console.error(error)
                });
            }, this);*/
            event.sender.send('init', res.headers['set-cookie']);
        }).end();
});

ipc.on('loadCaptcha', (e) => {
    api.loadCaptcha().then((url) => {
        e.sender.send('loadCaptcha', url);
    });
})

ipc.on('captcha', function (event, param) {    
    api.captcha(param).then(() => {
        event.sender.send('captcha', true);
    }, (code, message) => {
        event.sender.send('captcha', false, message);
    });    
});

ipc.on('login', (event, user, pass) => {
    const req = net.request({
        url: 'https://kyfw.12306.cn/passport/web/login',
        method: 'POST'
    });
    req.on('response', (res) => {
        if (res.statusCode == 200) {
            api.checkUAM().then(() => {
                event.sender.send('login', true);
            }, (code, statusMessage) => {
                event.sender.send('login', false, statusMessage);                
            });
        } else {
            event.sender.send('login', false, res.statusMessage);
        }
    });
    req.on('error', (error) => {
        console.log(error);
    })
    req.end(querystring.stringify({
        username: user,
        password: pass,
        appid: 'otn'
    }));
})