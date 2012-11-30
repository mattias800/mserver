var FileServlet = require("./servlets/impl/FileServlet.js");
var PageServlet = require("./servlets/impl/PageServlet.js");
var RpcServlet = require("./servlets/impl/RpcServlet.js");

var TestPage = {}; //require("../root/pages/TestPage.js");
var ComponentManager = require("./util/ComponentManager.js");

var Router = Class.extend({

    init : function() {

        this.pathPageMap = {};

        this.componentManager = new ComponentManager({router : this});
        this.sandbox = this.componentManager.sandbox;

    },

    addPagePath : function(path, page) {
        this.pathPageMap[path] = page;
    },

    createServlet : function(request, response, path) {
        // Which servlet to use is controlled via the path.
        var s = path.split("/");

        console.log("this.pathPageMap", this.pathPageMap);
        console.log("path", path);

        if (this.pathPageMap[path]) {
            return new PageServlet(request, response, this.pathPageMap[path]);
        }

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
