var login = function (req, res) {
    console.log('/process/login is called');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    console.log('Request Parameter : [' + paramId + '] / [' + paramPassword + ']');

    var database = req.app.get('database');

    if (database) {
        authUser(database, paramId, paramPassword, function (err, docs) {
            if (err) {
                console.log('Error occured');
                res.writeHead(400, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>Error Occured</h1>');
                res.end();
                return;
            }

            if (docs) {
                console.dir(docs);
                res.writeHead(400, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>User Login Success</h1>');
                res.write('<div><p>UserName : ' + docs[0].name + '</p></div>');
                res.write('<br><br><a href="/public/login.html">Login Again</a>');
                res.end();
            } else {
                console.log('Error occured');
                res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>User is not found</h1>');
                res.end();
            }
        });
    } else {
        console.log('Error occured');
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write('<h1>Database is not connected</h1>');
        res.end();
    }
};


var adduser = function (req, res) {
    console.log('/process/addUser is called');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    console.log(paramId + ' / ' + paramPassword + ' / ' + paramName);

    var database = req.app.get('database');
    if (database) {
        addUser(database, paramId, paramPassword, paramName, function (err, result) {
            if (err) {
                console.log('Error occured');
                res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>Error Occured</h1>');
                res.end();
            }

            if (result) {
                console.dir(result);
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
    } else {
        console.log('Error occured');
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write('<h1>Database is not connected</h1>');
        res.end();
    }
};
var listuser = function (req, res) {
    console.log('listuser is called');

    var database = req.app.get('database');

    if (database) {
        database.UserModel.findAll(function (err, results) {
            if (err) {
                console.log('Error occured');
                res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
                res.write('<h1>Database is not connected</h1>');
                res.end();
                return;
            }

            if (results) {
                console.dir(results);

                res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                res.write("<h3>User List</h3>");
                res.write("<div><ul>");

                for (var i = 0; i < results.length; i++) {
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
};

var authUser = function(userdb, id, password, callback ) {
    console.log('authUser is called : ' + id + ', ' + password);

    userdb.UserModel.findById(id, function(err, results) {
        if(err) {
            callback(err, null);
        }

        console.log('Result By Id %s', id);
        if (results.length > 0) {
            var iUser = new userdb.UserModel({id:id});
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

    var user = new userDb.UserModel({"id":id, "password":password, "name":name});
    user.save(function(err){
        if(err) {
            callback(err, null);
            return;
        }

        console.log('User Add Success');
        callback(null, user);
    });
};

module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;