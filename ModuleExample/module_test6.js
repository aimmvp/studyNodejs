var require = function(path) {
    var exports = {};
    exports.getUser= function() {
        return { id: 'test01', name: 'John' };
    };
    exports.group= { id: 'group1', name: 'Friend' };

    return exports;
}

var user = require('...');
function showUser() {
    return user.getUser().name + ', ' + user.group.name;
}

console.log('User Info test6 : ' + showUser());