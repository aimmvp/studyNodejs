var route_loader = {};

var config = require('../config');

route_loader.init = function(app, router) {
    console.log('route_loader init');

    initRoute(app, router);
};

function initRoute(app, router) {
    console.log('router_loader.initRoute');
    for ( var i = 0 ; i < config.route_info.length; i++ ) {
        var curItem = config.route_info[i];
        var curModule = require(curItem.file);
        if (curItem.type == 'get') {
            router.route(curItem.path).get(curModule[curItem.method]);
        } else if (curItem.type == 'post') {
            router.route(curItem.path).post(curModule[curItem.method]);
        } else {
            console.error('Route Type Error : ' + curItem.type);
        }
    }
    
    app.use('/', router);
}

module.exports = route_loader;