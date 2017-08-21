//const Vue = require('../node_modules/vue/dist/vue.common.js');
const ipc = require('electron').ipcRenderer;

var calendar = Vue.component('calendar', {
    template: '#cal',
    mounted: function () {
        scheduler.init('scheduler_here', new Date(), "month");
        ipc.send('queryOrder');
        ipc.on('queryOrder', function (e, tickets) {
            scheduler.parse(tickets, "json");
        })
    }
});