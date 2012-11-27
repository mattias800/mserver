creos.RpcResponse = Class.extend({

    init:function (args) {
        this.model = args.model;
        debugLog("OK this.model", this.model);
        this.message = args.message;
        this.resultType = args.resultType;
        this.error = args.error;
    },

    toObj:function () {
        return {
            model:this.model,
            message:this.message,
            resultType:this.resultType,
            error:this.error
        }
    }

});

creos.RpcResponse.createOk = function () {
    return new creos.RpcResponse({resultType:"OK"});
};

creos.RpcResponse.createOkWithModel = function (model) {
    return new creos.RpcResponse({model:model, resultType:"OK"});
};