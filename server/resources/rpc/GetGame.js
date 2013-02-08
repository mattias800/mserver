var mongo = require('mongodb').MongoClient;

Pages.registerRpc({

    id : "GetBus",
    path : "/rpc/GetGame",

    executeRpc : function(urlParameter, afterDone) {

        // Retrieve

        // Connect to the db

        if (urlParameter.id) {
            mongo.connect("mongodb://localhost:27017/exampleDb", function(err, db) {

                if (!err) {

                    var games = db.collection("games");
                    games.findOne({id : urlParameter.id }, function(err, game) {

                        console.log("game");
                        console.log(game);
                        if (game) {
                            afterDone({
                                response : RpcResponse.createOkWithModel(game)
                            });
                        } else {
                            afterDone({
                                response : RpcResponse.createWithResultType("NO_SUCH_GAME")
                            });
                        }

                    });

                } else {
                    afterDone({
                        response : RpcResponse.createDbError()
                    });

                }
            });
        } else {
            afterDone({
                response : RpcResponse.createIncompleteParameters()
            });
        }

    }

});