creos.RpcServlet = creos.ServletBase.extend({

    postInit:function () {
        this.rpcHeader = {'Content-Type':'application/json'};
    },

    getRpcAction:function (name) {
        return creos.rpc[name]
    },

    execute:function (afterDone) {
        var request = this.request;
        var response = this.response;

        var pathName = url.parse(request.url).pathname;
        var s = pathName.split("/");

        console.log("rpcController.writeResponse", pathName);

        if (s[1] !== "rpc") throw "RpcController requires path to start with 'rpc', i.e. /rpc/GetGame";
        var rpcName = s[2];
        var ActionClass = this.getRpcAction(rpcName);

        if (ActionClass == undefined) {
            // No such RPC exists.
            this.redirectTo(creos.NoSuchRpcServlet, afterDone);
            return;
        }

        var actionObj = new ActionClass(request, response);

        var url_parts = url.parse(request.url, true);
        var urlParameter = url_parts.query;

        try {
            var result = actionObj.execute(urlParameter, function (result) {

                // TODO: Validate result

                if (!result instanceof creos.RpcResponse) {
                    throw "RpcServlet.execute() must runt afterDone() with an RpcResponse as parameter. Parameter type: " + typeof result;
                }
                debugLog("Executing RPC action DONE!", result);

                var r = {
                    code:result.code ? result.code : 200,
                    header:result.header ? result.header : this.rpcHeader,
                    body:result.response.toObj()
                };

                debugLog("r", r);
                afterDone(r);
            });
        } catch (e) {
            this.redirectTo(creos.RpcErrorServlet, afterDone);
        }
    }

});