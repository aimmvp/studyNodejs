var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
    console.log("=====> CreateSchema Start");
    var UserSchema = mongoose.Schema({
        id: { type: String, required: true, unique: true, default: '' },
        hashed_password: { type: String, required: true, default: '' },
        salt: { type: String, required: true },
        name: { type: String, index: 'hashed', default: '' },
        age: { type: Number, default: -1 },
        created_at: { type: Date, index: { unique: false }, 'default': Date.now() },
        updated_at: { type: Date, index: { unique: false }, 'default': Date.now() }
    });
    console.log('UserScheme is defined');

    UserSchema.virtual('password')
        .set(function (password) {
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
            console.log('hahed_password : [' + this.hashed_password + ']');
        });

    UserSchema.method('encryptPassword', function (plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    UserSchema.method('makeSalt', function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    UserSchema.method('authenticate', function (plainText, inSalt, hashed_password) {
        console.log('authenticate is called');
        if (inSalt) {
            return this.encryptPassword(plainText, inSalt) === hashed_password;
        } else {
            return this.encryptPassword(plainText) === hashed_password;
        }
    });

    UserSchema.static('findById', function (id, callback) {
        return this.find({ id: id }, callback);
    });

    UserSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    });

    console.log("=====> CreateSchema End");
    return UserSchema;
};

module.exports = Schema;