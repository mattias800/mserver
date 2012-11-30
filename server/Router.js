var FileServlet = require("./servlets/impl/FileServlet.js");
var PageServlet = require("./servlets/impl/PageServlet.js");
var RpcServlet = require("./servlets/impl/RpcServlet.js");

var TestPage = {}; //require("../root/pages/TestPage.js");
var Includer = require("./util/Includer.js");

var Router = Class.extend({

    init : function() {
        this.includer = new Includer();
        this.sandbox = this.includer.sandbox;

        console.log("Routers sandbox", this.sandbox);
    },

    createServlet : function(request, response, path) {
        // Which servlet to use is controlled via the path.
        var s = path.split("/");

        switch (s[1]) {
            case "rpc":
                // Path: /rpc/*
                console.log("Creating RpcServlet for rpc prefix.");
                return new RpcServlet(request, response, path);

            case undefined:
                // Path: /
                console.log("Creating FileServlet for / path.");
                return new FileServlet(request, response, "index.html");

            case "":
                // Path: /
                console.log("Creating FileServlet for empty path.");
                return new FileServlet(request, response, "index.html");

            case "page":
                // Path: /
                console.log("Creating PageServlet for page path.");
                return new PageServlet(request, response, new TestPage());

            default:
                // Path: * (everything else)
                console.log("Creating FileServlet for everything else.");
                return new FileServlet(request, response); // No explicit filename.

        }
    }

});

module.exports = Router;
