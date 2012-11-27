creos.rpc = {};

creos.RpcActionBase = Class.extend({

    init:function (request, response) {
        this.request = request;
        this.response = response;
    },

    execute:function (request, response) {
        throw "RpcBase subclasses must implement execute.";
    }


});