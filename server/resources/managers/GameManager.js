var db = globals.db;

mserver.registerManager(
    {
        id : "GameManager",

        manager : {

            getGameWithId : function(id, afterDone) {
                db.collection("games").findOne({id : id }, function(err, game) {
                    afterDone(game, err);
                });
            }

        }
    }
);
