var FileServlet = require("./servlets/impl/FileServlet.js");
var PageServlet = require("./servlets/impl/PageServlet.js");
var RpcServlet = require("./servlets/impl/RpcServlet.js");

var TestPage = {}; //require("../root/pages/TestPage.js");
var ComponentManager = require("./util/ComponentManager.js");
var ViewManager = require("./util/ViewManager.js");

var Router = Class.extend({

    init : function() {

        this.pathPageMap = {};

        this.viewManager = new ViewManager({router : this});
        this.componentManager = new ComponentManager({router : this, viewManager : this.viewManager});

        this.sandbox = this.componentManager.sandbox;

    },

    registerPageAtPath : function(pageClass, path) {
        // TODO: Warn if path is already in use!
        this.pathPageMap[path] = pageClass;
    },

    createServlet : function(request, response, path) {
        // Which servlet to use is controlled via the path.
        var s = path.split("/");

        var PageClass = this.pathPageMap[path];

        if (PageClass) {
            return new PageServlet(
                request,
                response,
                PageClass,
                this.componentManager
            );
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
