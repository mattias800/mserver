var WebSocket = Class.extend({

    init : function(request, response) {
        this.request = request;
        this.response = response;
    },

    onOpen : function() {
        throw "RpcBase subclasses must implement executeRpc().";
    },

    onClose : function() {
        throw "RpcBase subclasses must implement executeRpc().";
    },

    onMessage : function(text) {
        throw "RpcBase subclasses must implement executeRpc().";
    },

    onData : function(data) {
        throw "RpcBase subclasses must implement executeRpc().";
    }


});

module.exports = WebSocket;
