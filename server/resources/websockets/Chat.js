mserver.registerWebSocket({

    id : "Chat",
    path : "/websocket/Chat",
    protocol : "echo-protocol",

    onListening : function() {
        console.log("Listening...");
    },

    onRequest : function(request) {
        console.log("onRequest");
    },

    onAccept : function(connection) {
        console.log("onAccept");
        console.log('Peer ' + connection.remoteAddress + ' connected.');
    },

    onClose : function(connection) {
        console.log("onClose");
    },

    onText : function(connection, text) {
        console.log("onText", text);
        this.sendText(connection, text + "?? gay!");
    },

    onBinary : function(connection, data) {
        console.log("onData", data);
    }

});
