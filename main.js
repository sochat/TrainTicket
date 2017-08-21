const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const ipc = electron.ipcMain;
const net = electron.net;
const session = electron.session;
const api = require('./api');

let mainWindow;

app.commandLine.appendSwitch('ignore-certificate-errors');
app.on("ready", function () {
    mainWindow = new BrowserWindow({
        width: 800, height: 600, 
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
            session.defaultSession.cookies.set({
                name: 'fp_ver',
                value: '4.5.1',
                path: '/',
                //domain: 'kyfw.12306.cn',
                url: 'https://kyfw.12306.cn/'
            }, () => {});
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
    }, (message) => {
        event.sender.send('captcha', false, message);
    });    
});

ipc.on('login', (event, user, pass) => {
    api.login(user, pass).then(() => {
        event.sender.send('login', true);
    }, (statusMessage) => {
        event.sender.send('login', false, statusMessage);
    });    
});

function formatDate(d) {
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
    var pad = function (num) {
        var s = num+"";
        while (s.length < 2) s = "0" + s;
        return s;
    }
    return curr_year + "-" + pad(curr_month) + "-" + pad(curr_date);
}

ipc.on('queryOrder', (event) => {
    var date = new Date();
    var end = new Date(date.getTime() + 30 * 86400 * 1000);
    api.queryOrder(formatDate(date), formatDate(end))
    .then((result) => {
        let list = result.data.OrderDTODataList;
        let tickets = [];
        list.forEach(function(element) {
            element.tickets.forEach(ticket => {
                tickets.push({
                    text: ticket.stationTrainDTO.from_station_name + '--' + ticket.stationTrainDTO.to_station_name,
                    start_date: ticket.start_train_date_page,
                    end_date: new Date(Date.parse(ticket.train_date) + Date.parse(ticket.stationTrainDTO.arrive_time)).toLocaleString('ja-JP')
                });
            });            
        });
        event.sender.send('queryOrder', tickets);
    })
})