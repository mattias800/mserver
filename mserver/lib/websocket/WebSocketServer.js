var websocket = require("websocket").server;

var WebSocketServer = Class.extend({

    init : function(args) {
        this.httpServer = args.httpServer;
        this.wsServer = undefined;

        this.connections = {};

        this.setupSocket();
    },

    setupSocket : function() {
        var that = this;

        this.wsServer = new websocket({
            httpServer : this.httpServer,
            autoAcceptConnections : false
        });

        this.wsServer.on('request', function(request) {

            that.onRequest(request);

            if (that.originIsAllowed(request.origin)) {

                var connection = request.accept(that.protocol, request.origin);

                connection.on('message', function(message) {
                    if (message.type === 'utf8') {
                        that.onText(connection, message.utf8Data);
                    }
                    else if (message.type === 'binary') {
                        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                        that.onBinary(connection, message.binaryData);
                    }
                });

                connection.on('close', function(reasonCode, description) {
                    that.onClose(connection, request, reasonCode, description);
                });

                this.connections[request.origin] = connection;

                that.onAccept(connection, request);

            } else {

                request.reject();
                that.onReject(request);
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            }

        });

        this.onListening();

    },

    sendBinary : function(connection, data) {
        connection.sendBytes(data)
    },

    sendText : function(connection, message) {
        connection.sendUTF(message);
    },

    onListening : function() {
    },

    onRequest : function(request) {

    },

    onAccept : function(connection, request) {

    },

    onReject : function(request) {

    },

    onClose : function(connection, request, reasonCode, description) {
    },

    onText : function(connection, text) {
    },

    onBinary : function(connection, data) {
    },

    originIsAllowed : function(origin) {
        return true;
    }



});

module.exports = WebSocketServer;
