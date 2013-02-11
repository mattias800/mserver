mserver.registerWebSocket({

    id : "Chat",
    path : "/websocket/Chat",
    protocol : "echo-protocol",

    onListening : function() {

    },

    onRequest : function(request) {
        console.log("onRequest");
    },

    onAccept : function(connection) {
        console.log("onAccept");
    },

    onClose : function(connection) {
        console.log("onClose");
    },

    onText : function(connection, text) {
        console.log("onText", text);
        connection.sendUTF(text + "?? gay!");
    },

    onBinary : function(connection, data) {
        console.log("onData", data);
    }

});
