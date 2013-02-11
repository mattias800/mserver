var ServletBase = require("../ServletBase.js");


var WebSocketServlet = ServletBase.extend({

    init : function(request, response, WebSocketClass, componentManager) {
        this._super(request, response);
        if (WebSocketClass == undefined) throw "WebSocketServlet initialization error, got undefined WebSocketClass.";
        this.WebSocketClass = WebSocketClass;

        // Do nothing! WebSockets are instantiated at load, then never again!
        //this.webSocketObj = new WebSocketClass({resourceLoader : componentManager});

        // Init WebSocket here.
        // Setup onMessage, etc, on webSocketObj.
    },

    execute : function(afterDone) {
        // Do nothing here?
    }

});

module.exports = WebSocketServlet;
