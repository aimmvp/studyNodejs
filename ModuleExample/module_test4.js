var user = require('./user4');

function showUser() {
    return user().name;
}
console.log("User Name : " + showUser());
