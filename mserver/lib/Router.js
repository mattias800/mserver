var FileServlet = require("./servlets/impl/FileServlet.js");
var PageServlet = require("./servlets/impl/PageServlet.js");
var RpcServlet = require("./servlets/impl/RpcServlet.js");

var TestPage = {}; //require("../root/pages/TestPage.js");
var ResourceLoader = require("./util/ResourceLoader.js");
var ViewManager = require("./util/ViewManager.js");

var Router = Class.extend({

    init : function(args) {

        this.mserver = args.mserver;
        this.resourceDir = args.resourceDir;
        this.staticDir = args.staticDir;

        this.pageClassPerPath = {};
        this.rpcClassPerPath = {};
        this.webSocketClassPerPath = {};

        this.viewManager = new ViewManager({router : this});

        this.resourceLoader = new ResourceLoader({
            mserver : this.mserver,
            router : this,
            viewManager : this.viewManager,
            resourceDir : this.resourceDir
        });

        this.sandbox = this.resourceLoader.sandbox;

    },

    /**
     * Registers a page at a path. The page is specified by a Page subclass, not an object instance.
     * The instance is created when receiving the request.
     * @param pageClass
     * @param path
     */
    registerPageAtPath : function(pageClass, path) {
        // TODO: Warn if path is already in use!
        if (this.pageClassPerPath[path]) throw "Trying to register page at path " + path + " but there is already a page registered on that path.";
        if (this.rpcClassPerPath[path]) throw "Trying to register page at path " + path + " but there is already an RPC registered on that path.";
        this.pageClassPerPath[path] = pageClass;
    },

    registerRpcAtPath : function(rpcClass, path) {
        // TODO: Warn if path is already in use!
        if (this.pageClassPerPath[path]) throw "Trying to register RPC at path " + path + " but there is already a page registered on that path.";
        if (this.rpcClassPerPath[path]) throw "Trying to register RPC at path " + path + " but there is already an RPC registered on that path.";
        this.rpcClassPerPath[path] = rpcClass;
    },

    registerWebSocketAtPath : function(rpcClass, path) {
        // TODO: Warn if path is already in use!
        if (this.pageClassPerPath[path]) throw "Trying to register RPC at path " + path + " but there is already a page registered on that path.";
        if (this.rpcClassPerPath[path]) throw "Trying to register RPC at path " + path + " but there is already an RPC registered on that path.";
        this.webSocketClassPerPath[path] = rpcClass;
    },

    pathIsInUse : function(path) {
        return this.pageClassPerPath[path] || this.rpcClassPerPath[path];
    },

    createServlet : function(request, response, path) {

        if (!path) path = "/";

        var PageClass = this.pageClassPerPath[path];

        if (PageClass) {
            return new PageServlet(request, response, PageClass, this.resourceLoader);
        }

        var RpcClass = this.rpcClassPerPath[path];

        if (RpcClass) {
            return new RpcServlet(request, response, RpcClass, this.resourceLoader);
        }

        var WebSocketClass = this.webSocketClassPerPath[path];

        if (WebSocketClass) {
            return new WebSocketServlet(request, response, WebSocketClass, this.resourceLoader);
        }

        if (path == "/") {
            // Default to index.html in root, when no Page has been registered there.
            return new FileServlet(request, response, this.staticDir, "index.html");
        }

        // If nothing else works, use static files.
        return new FileServlet(request, response, path, this.staticDir);

    }

});

module.exports = Router;
