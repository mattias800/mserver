creos.Router = Class.extend({

    init : function() {

    },

    createServlet : function(request, response, path) {
        // Which servlet to use is controlled via the path.
        var s = path.split("/");

        switch (s[1]) {
            case "rpc":
                // Path: /rpc/*
                debugLog("Creating RpcServlet for rpc prefix.");
                return new creos.RpcServlet(request, response, path);

            case undefined:
                // Path: /
                debugLog("Creating FileServlet for / path.");
                return new creos.FileServlet(request, response, "index.html");

            case "":
                // Path: /
                debugLog("Creating FileServlet for empty path.");
                return new creos.FileServlet(request, response, "index.html");

            case "page":
                // Path: /
                debugLog("Creating PageServlet for page path.");
                return new creos.PageServlet(request, response, new creos.TestPage());

            default:
                // Path: * (everything else)
                debugLog("Creating FileServlet for everything else.");
                return new creos.FileServlet(request, response); // No explicit filename.

        }
    }

});