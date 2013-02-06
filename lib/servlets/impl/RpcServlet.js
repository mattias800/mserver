var ServletBase = require("../ServletBase.js");
var RpcResponse = require("../../rpc/RpcResponse.js");
var RpcErrorServlet = require("./RpcErrorServlet.js");

var url = require("url");

var RpcServlet = ServletBase.extend({

    init : function(request, response, RpcClass, componentManager) {
        this._super(request, response);
        if (RpcClass == undefined) throw "RpcServlet initialization error, got undefined RpcClass.";
        this.RpcClass = RpcClass;
        this.rpcObj = new this.RpcClass(request, response);
    },

    postInit : function() {
        this.rpcHeader = {'Content-Type' : 'application/json'};
    },

    execute : function(afterDone) {
        var request = this.request;
        var response = this.response;


        var url_parts = url.parse(request.url, true);
        var urlParameter = url_parts.query;

        try {
            var result = this.rpcObj.executeRpc(urlParameter, function(result) {

                // TODO: Validate result

                if (!result instanceof RpcResponse) {
                    throw "RpcServlet.execute() must run afterDone() with an RpcResponse as parameter. Parameter type: " + typeof result;
                }

                var r = {
                    code : result.code ? result.code : 200,
                    header : result.header ? result.header : this.rpcHeader,
                    body : result.response.toObj()
                };

                afterDone(r);
            });
        } catch (e) {
            console.log("Error executing RPC: " + e.toString());
            this.redirectTo(RpcErrorServlet, afterDone);
        }
    }

});

module.exports = RpcServlet;
