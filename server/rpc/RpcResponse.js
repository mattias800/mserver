var RpcResponse = Class.extend({

    init : function(args) {
        this.model = args.model;
        console.log("OK this.model", this.model);
        this.message = args.message;
        this.resultType = args.resultType;
        this.error = args.error;
    },

    toObj : function() {
        return {
            model : this.model,
            message : this.message,
            resultType : this.resultType,
            error : this.error
        }
    }

});

RpcResponse.createOk = function() {
    return new creos.RpcResponse({resultType : "OK"});
};

RpcResponse.createOkWithModel = function(model) {
    return new RpcResponse({model : model, resultType : "OK"});
};

module.exports = RpcResponse;
