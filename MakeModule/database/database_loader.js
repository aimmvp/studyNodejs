var config = require('../config');
var mongoose = require('mongoose');
var database = {};

database.init = function(app, config) {
    console.log('database_loader init called');

    connect(app, config);
};

function connect(app, config) {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db_url);
    database.db = mongoose.connection;

    database.db.on('open', function() {
        console.log('Database is connected : ' + config.db_url);

        createSchema(app, config);
    });

    database.db.on('disconnected', function() {
        console.log('Database is disconnected');
    });

    database.db.on('error', console.error.bind(console, 'mongoose connection error'));
}


function createSchema(app, config) {
    console.log('database_loader schemas length : ' + config.db_schemas.length);

    for (var i = 0 ; i < config.db_schemas.length ; i ++ ) {
        var curItem = config.db_schemas[i];

        var curSchema = require(curItem.file).createSchema(mongoose);
        console.log('%s Schema created', curItem.file);

        var curModel = mongoose.model(curItem.collection, curSchema);

        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;

        console.log('Schema[%s], Model[%s]', curItem.schemaName, curItem.modelName);
    }

    app.set('database', database);
}

module.exports = database;