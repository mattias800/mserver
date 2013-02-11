var FileServlet = require("./servlets/impl/FileServlet.js");
var PageServlet = require("./servlets/impl/PageServlet.js");
var RpcServlet = require("./servlets/impl/RpcServlet.js");

var TestPage = {}; //require("../root/pages/TestPage.js");
var ResourceLoader = require("./ResourceLoader.js");
var ViewManager = require("./util/ViewManager.js");

var Router = Class.extend({

    init : function(args) {

        this.mserver = args.mserver;
        this.resourceDir = args.resourceDir;
        this.staticDir = args.staticDir;
        this.globals = args.globals;

        this.pageClassPerPath = {};
        this.rpcClassPerPath = {};
        this.webSocketClassPerPath = {};

        this.viewManager = new ViewManager({
            router : this,
            autoRefreshResources : args.autoRefreshResources
        });

        this.resourceLoader = new ResourceLoader({
            mserver : this.mserver,
            router : this,
            viewManager : this.viewManager,
            resourceDir : this.resourceDir,
            globals : this.globals,
            autoRefreshResources : args.autoRefreshResources
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
        if (this.pageClassPerPath[path]) throw "Trying to register web socket at path " + path + " but there is already a page registered on that path.";
        if (this.rpcClassPerPath[path]) throw "Trying to register web socket at path " + path + " but there is already an RPC registered on that path.";
        this.webSocketClassPerPath[path] = rpcClass;
    },

    resetAllPaths : function() {
        this.pageClassPerPath = {};
        this.rpcClassPerPath = {};
        this.webSocketClassPerPath = {};
    },

    pathIsInUse : function(path) {
        return this.pageClassPerPath[path] || this.rpcClassPerPath[path];
    },

    createServlet : function(request, response, path, callback) {

        var that = this;

        if (!path) path = "/";

        var PageClass = this.pageClassPerPath[path];

        if (PageClass) {
            return callback(new PageServlet(request, response, PageClass, this.resourceLoader));
        }

        var RpcClass = this.rpcClassPerPath[path];

        if (RpcClass) {
            return callback(new RpcServlet(request, response, RpcClass, this.resourceLoader));
        }

        var WebSocketClass = this.webSocketClassPerPath[path];

        if (WebSocketClass) {
            return callback(new WebSocketServlet(request, response, WebSocketClass, this.resourceLoader));
        }

        if (path == "/") {
            // Default to index.html in root, when no Page has been registered there.
            return callback(new FileServlet(request, response, this.staticDir, "index.html"));
        }

        // If nothing else works, use static files.
        var fileServlet = new FileServlet(request, response, this.staticDir, path);
        fileServlet.fileExists(function(exists) {
            if (exists) {
                return callback(fileServlet);
            } else {
                return callback(new FileServlet(request, response, that.staticDir, "404.html"));
            }
        });

    }

});

module.exports = Router;
