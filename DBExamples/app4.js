var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');
var mongoose = require('mongoose');

// Crypto Module 
var crypto = require('crypto');

var database;
var UserSchema;
var UserModel;

function connectDB() {
    var databaseUrl = 'mongodb://localhost:27017/local';

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    database.on('open', function() {
        console.log('Database is connected : ' + databaseUrl);

        UserSchema = mongoose.Schema({
            id: {type:String, required:true, unique:true, default: ''},
            hashed_password: {type:String, required:true, default: ''},
            salt: {type:String, required:true},
            name: {type:String, index:'hashed', default: ''},
            // password: {type:String, required:true},
            age: {type:Number, default:-1},
            created_at: {type:Date, index:{unique:false}, 'default':Date.now()},
            updated_at: {type:Date, index:{unique:false}, 'default':Date.now()}
        });
        console.log('UserScheme is defined');

        UserSchema.virtual('password')
            .set(function (password) {
                this.salt = this.makeSalt();
                this.hashed_password = this.encryptPassword(password);
                console.log('hahed_password : [' + this.hashed_password + ']');
            });

        UserSchema.method('encryptPassword', function(plainText, inSalt) {
            if (inSalt) {
                return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
            } else {
                return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
            }
        });

        UserSchema.method('makeSalt', function(){
            return Math.round((new Date().valueOf() * Math.random())) + '';
        });

        UserSchema.method('authenticate', function(plainText, inSalt, hashed_password){
            console.log('authenticate is called');
            if (inSalt) {
                return this.encryptPassword(plainText, inSalt) === hashed_password;
            } else {
                return this.encryptPassword(plainText) === hashed_password;
            }
        });

        UserSchema.static('findById', function(id, callback) {
            return this.find({id:id}, callback);
        });

        /*
        UserSchema.statics.findById = function(id, callback) {
            return this.find({id:id}, callback);
        }
        */
        UserSchema.static('findAll', function(callback) {
            return this.find({}, callback);
        });

        UserModel = mongoose.model('users3', UserSchema);
        console.log('UserModel is defined');
    });

    database.on('disconnected', function() {
        console.log('Database is disconnected');
    });

    database.on('error', console.error.bind(console, 'mongoose connection error'));
    /*
    MongoClient.connect(databaseUrl, function(err, client) {
        if (err) {
            console.log('Database Connection Error~~~');
            return;
        }
        var db = client.db("local");
        console.log('Database Connected : ' + databaseUrl);
        database = db;
    });
    */
}



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

var router = express.Router();

router.route('/process/login').post(function(req, res) {
    console.log('/process/login is called');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;  
    console.log('Request Parameter : [' + paramId + '] / [' + paramPassword + ']');

    if (database) {
        authUser(database, paramId, paramPassword, function(err, docs) {
            if (err) {
                console.log('Error occured');
                res.writeHead(400, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>Error Occured</h1>');
                res.end();
                return;
            }

            if (docs) {
                console.dir(docs);
                res.writeHead(400, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>User Login Success</h1>');
                res.write('<div><p>UserName : ' + docs[0].name + '</p></div>');
                res.write('<br><br><a href="/public/login.html">Login Again</a>');
                res.end();
            } else {
                console.log('Error occured');
                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>User is not found</h1>');
                res.end();
            }
        });
    } else{
        console.log('Error occured');
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write('<h1>Database is not connected</h1>');
        res.end();
    }
});

router.route('/process/adduser').post(function(req, res){
    console.log('/process/addUser is called');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    console.log(paramId + ' / ' + paramPassword + ' / ' + paramName);

    if (database) {
        addUser(database, paramId, paramPassword, paramName, function(err, result) {
            if(err) {
                console.log('Error occured');
                res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>Error Occured</h1>');
                res.end();
            }

            if (result) {
                console.dir(result);
                res.writeHead(400, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>User Add Success</h1>');
                res.write('<div><p>UserName : ' + paramName + '</p></div>');
                res.end();
            } else {
                console.log('Error occured');
                res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>User Add Fail</h1>');
                res.end();
            }
        });
    } else {
        console.log('Error occured');
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write('<h1>Database is not connected</h1>');
        res.end();
    }

});

router.route('/process/listuser').post(function(req, res) {
    console.log('listuser is called');

    if (database) {
        UserModel.findAll(function(err, results) {
            if (err) {
                console.log('Error occured');
                res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>Database is not connected</h1>');
                res.end();
                return;
            }

            if(results) {
                console.dir(results);

                res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
                res.write("<h3>User List</h3>");
                res.write("<div><ul>");

                for (var i = 0 ; i < results.length ; i++ ){
                    var curId = results[i]._doc.id;
                    var curName = results[i]._doc.name;
                    res.write("      <li>#" + i + " --> " + curId + ", " + curName + "</li>");
                }

                res.write("</ul></div>");
                res.end();
            } else {
                console.log('Error occured');
                res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>No Users</h1>');
                res.end();
            }
        });
    } else {
        console.log('Error occured');
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write('<h1>Database is not connected</h1>');
        res.end();
    }
});

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
