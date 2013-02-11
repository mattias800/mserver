var RpcResponse = Class.extend({

    init : function(args) {
        this.model = args.model;
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
    return new RpcResponse({resultType : "OK"});
};

RpcResponse.createOkWithModel = function(model) {
    return new RpcResponse({model : model, resultType : "OK"});
};

RpcResponse.createError = function() {
    return new RpcResponse({resultType : "ERROR"});
};

RpcResponse.createDbError = function() {
    return new RpcResponse({resultType : "DB_ERROR"});
};

RpcResponse.createWithResultType = function(resultType) {
    return new RpcResponse({resultType : resultType});
};

RpcResponse.createIncompleteParameters = function() {
    return new RpcResponse({resultType : "INCOMPLETE_PARAMETERS"});
};

RpcResponse.createNoObjectWithSpecifiedId = function() {
    return new RpcResponse({resultType : "NO_OBJECT_WITH_SPECIFIED_ID"});
};

module.exports = RpcResponse;
