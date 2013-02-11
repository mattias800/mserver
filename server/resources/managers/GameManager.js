mserver.registerManager(
    {
        id : "GameManager",

        getGameWithId : function(id, afterDone) {
            globals.db.collection("games").findOne({id : id }, function(err, game) {
                afterDone(game, err);
            });
        }

    }
);
