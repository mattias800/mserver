creos.rpcGetGame = creos.RpcActionBase.extend({

    execute : function(urlParameter, afterDone) {
        var game = {
            id : "test",
            scripts : {
                load : "startGame();"
            }
        };

        afterDone({
            response : creos.RpcResponse.createOkWithModel(game)
        });
    }

});