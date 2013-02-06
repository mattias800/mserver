Pages.registerRpc({

    id : "GetBus",
    path : "/rpc/GetGame",

    executeRpc : function(urlParameter, afterDone) {
        var game = {
            id : "test",
            scripts : {
                load : "startGame();"
            }
        };

        afterDone({
            response : RpcResponse.createOkWithModel(game)
        });
    }

});