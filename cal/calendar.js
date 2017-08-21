//const Vue = require('../node_modules/vue/dist/vue.common.js');

var calendar = Vue.component('calendar', {
    template: '#cal',
    mounted: function () {
        scheduler.init('scheduler_here', new Date(), "month");
    }
});