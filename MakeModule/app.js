var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');
var mongoose = require('mongoose');

var user = require('./routes/user');

// Crypto Module 
var crypto = require('crypto');

var database;
var UserSchema;
var UserModel;

var app = express();

app.set('port', process.env.PORT | 3000);
app.use('/public', static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized:true
}));

function connectDB() {
    var databaseUrl = 'mongodb://localhost:27017/local';

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    database.on('open', function() {
        console.log('Database is connected : ' + databaseUrl);

        createUserSchema(database);
    });

    database.on('disconnected', function() {
        console.log('Database is disconnected');
    });

    database.on('error', console.error.bind(console, 'mongoose connection error'));
}

function createUserSchema(database) {
    database.UserSchema = require('./database/user_schema').createUserSchema(mongoose);
    database.UserModel = mongoose.model('users3', database.UserSchema);
    console.log('UserModel is defined');
}

var router = express.Router();

router.route('/process/login').post(user.login);
router.route('/process/adduser').post(user.adduser);
router.route('/process/listuser').post(user.listuser);

app.use('/', router);

var authUser = function(userdb, id, password, callback ) {
    console.log('authUser is called : ' + id + ', ' + password);

    UserModel.findById(id, function(err, results) {
        if(err) {
            callback(err, null);
        }

        console.log('Result By Id %s', id);
        if (results.length > 0) {
            var iUser = new UserModel({id:id});
            var bAuthenticated = iUser.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);

            if (bAuthenticated) { 
            // if (results[0]._doc.password === password) {
                console.log('Password is Equal');
                callback(null, results);
            } else {
                console.log('Password is not equal');
                callback(null, null);
            }
        } else {
            console.log('Find Id[%s] is fail', id);
            callback(null, null);
        }
    });
};

var addUser = function(userDb, id, password, name, callback) {
    console.log('addUser is called : ' + id + ' / ' + password + ' / ' + name);

    var user = new UserModel({"id":id, "password":password, "name":name});
    user.save(function(err){
        if(err) {
            callback(err, null);
            return;
        }

        console.log('User Add Success');
        callback(null, user);
    });
};

// 404 Page
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express Server is started : ' + app.get('port'));

    connectDB();
});
