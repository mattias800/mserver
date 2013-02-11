var mserver = require("../mserver/");

var mongodb = require("mongodb");

mongodb.connect("mongodb://localhost:27017/exampleDb", function(err, db) {

    if (!err) {
        var server = new mserver.startServer({
            staticDir : "static",
            resourceDir : "resources",
            globals : {
                db : db
            },
            autoRefreshResources : false
        });
    } else {
        console.log("Unable to connect to database.");
    }


});

