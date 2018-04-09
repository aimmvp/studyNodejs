var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'test',
    debug: false
});

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

var router = express.Router();

router.route('/process/adduser').post(function(req, res) {
    console.log('MySql adduser called');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;  
    var paramName = req.body.name || req.query.name;
    var paramAge = req.body.age || req.query.age;

    console.log(paramId + ' / ' + paramPassword + ' / ' + paramName + " / " + paramAge);

    addUser(paramId, paramName, Number(paramAge), paramPassword, function(err, addedUser) {
        if (err) {
            console.log('Error occured');
            res.writeHead(400, { "Content-Type": "text/html;charset=utf8" });
            res.write('<h1>Error Occured</h1>');
            res.end();
            return;
        }

        if (addedUser) {
            console.dir(addedUser);
            res.writeHead(400, { "Content-Type": "text/html;charset=utf8" });
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
});

var authUser = function(id, password, callback) {
    pool.getConnection(function(err, conn) {
        if (err) {
            if(conn) {
                conn.release();
            }

            callback(err, null);
            return;
        }

        console.log('Database Connection Thread Id : ' + conn.threadId);

        var tablename = 'users';
        var columns = ['userid', 'name', 'age'];
        var exec = conn.query("select ?? from ?? where userid = ? and password=?", [columns, tablename, id, password], 
        function(err, rows){
            conn.release();
            console.log('authuser SQL : ' + exec.sql);

            if (err) {
                callback(err, null);
                return;
            }

            if (rows.length > 0 ) {
                console.log("Find User Success");
                callback(null, rows);
            } else {
                console.log("Find User Fail");
                callback(null, null);
            }
        });
    });
};

router.route('/process/login').post(function(req, res) {
    console.log('/process/login is called');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;  
    console.log('Request Parameter : [' + paramId + '] / [' + paramPassword + ']');

        authUser(paramId, paramPassword, function(err, rows) {
            if (err) {
                console.log('Error occured');
                res.writeHead(400, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>Error Occured</h1>');
                res.end();
                return;
            }

            if (rows) {
                console.dir(rows);
                res.writeHead(400, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>User Login Success</h1>');
                res.write('<div><p>UserName : ' + rows[0].name + '</p></div>');
                res.write('<br><br><a href="/public/login.html">Login Again</a>');
                res.end();
            } else {
                console.log('Error occured');
                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>User is not found</h1>');
                res.end();
            }
        });
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


var addUser = function(id, name, age, password, callback) {
    console.log('mysql addUser is called');

    pool.getConnection(function(err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }
        console.log('MySQL thread ID : ' + conn.threadId);

        var data = {userid:id, name:name, age:age, password:password};
        var exec = conn.query('insert into users set ?', data, function(err, result) {
            conn.release();
            console.log('Execute SQL: ' + exec.sql);            

            if (err) {
                console.log('Execute SQL Fail');
                console.dir(err);
                callback(err, null);
                return;
            }

            callback(null, result);
        });

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

    // connectDB();
});
