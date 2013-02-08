mserver.registerRpc({

    id : "GetBus",
    path : "/rpc/GetGame",

    executeRpc : function(urlParameter, afterDone) {

        var db = globals.db;

        if (urlParameter.id) {

            managers.GameManager.getGameWithId(urlParameter.id, function(game, err) {

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
                response : RpcResponse.createIncompleteParameters()
            });
        }

    }

});
