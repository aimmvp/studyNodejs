var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');

var user = require('./routes/user');

var config = require('./config');

var database_loader = require('./database/database_loader');
var route_loader = require('./routes/route_loader');

// Crypto Module 
var crypto = require('crypto');

var app = express();

console.log('config.server_port : [' + config.server_port + ']');
app.set('port', config.server_port || 3000);
app.use('/public', static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized:true
}));

function createUserSchema(database) {
    database.UserSchema = require('./database/user_schema').createUserSchema(mongoose);
    database.UserModel = mongoose.model('users3', database.UserSchema);
    console.log('UserModel is defined');
}

route_loader.init(app, express.Router());

// 404 Page
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express Server is started : ' + app.get('port'));

    database_loader.init(app, config);
});
