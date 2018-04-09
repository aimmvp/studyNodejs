var mongoose = require('mongoose');

var database;
var UserSchema;
var UserModel;

function connectDB() {
    var databaseUrl = "mongodb://localhost:27017/local";
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    database.on('open', function() {
        console.log('Database is connected : ' + databaseUrl);

        createUserSchema();

        doTest();

        /*
        UserSchema.statics.findById = function(id, callback) {
            return this.find({id:id}, callback);
        }
        */
        UserSchema.static('findAll', function(callback) {
            return this.find({}, callback);
        });

        UserModel = mongoose.model('users2', UserSchema);
        console.log('UserModel is defined');
    });

    database.on('disconnected', function() {
        console.log('Database is disconnected');
    });

    database.on('error', console.error.bind(console, 'mongoose connection error'));
}

function createUserSchema() {
    UserSchema = mongoose.Schema({
        id: { type: String, required: true, unique: true },
        name: { type: String, index: 'hashed' },
        age: { type: Number, 'default': -1 },
        created_at: { type: Date, index: { unique: false }, 'default': Date.now() },
        updated_at: { type: Date, index: { unique: false }, 'default': Date.now() }
    });
    console.log('UserScheme is defined');

    UserSchema.virtual("info")
        .set(function(info) {
            var splited = info.split(' ');
            this.id = splited[0];
            this.name = splited[1];
            console.log('virtual info values['+ this.id + '][' + this.name + ']');
        })
        .get(function() {
            return this.id + ' ' + this.name
        });
    UserModel = mongoose.model("users4", UserSchema);
    console.log("Users4 defined");
}

function doTest() {
    var user = new UserModel({"info": "test01 john"});
    user.save(function(err) {
        if (err) {
            console.log("error ~~~~~~~~");
            return;
        }
        console.log('Data Inserted');
    });

}

connectDB();

