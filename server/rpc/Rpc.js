var Rpc = Class.extend({

    init : function(request, response) {
        this.request = request;
        this.response = response;
    },

    executeRpc : function(request, response) {
        throw "RpcBase subclasses must implement executeRpc().";
    }


});

module.exports = Rpc;
