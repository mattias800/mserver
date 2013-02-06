var FileServlet = require("./servlets/impl/FileServlet.js");
var PageServlet = require("./servlets/impl/PageServlet.js");
var RpcServlet = require("./servlets/impl/RpcServlet.js");

var TestPage = {}; //require("../root/pages/TestPage.js");
var ComponentManager = require("./util/ComponentManager.js");
var ViewManager = require("./util/ViewManager.js");

var Router = Class.extend({

    init : function() {

        this.pageClassPerPath = {};
        this.rpcClassPerPath = {};

        this.viewManager = new ViewManager({router : this});
        this.componentManager = new ComponentManager({router : this, viewManager : this.viewManager});

        this.sandbox = this.componentManager.sandbox;

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

    createServlet : function(request, response, path) {

        var PageClass = this.pageClassPerPath[path];

        if (PageClass) {
            return new PageServlet(request, response, PageClass, this.componentManager);
        }

        var RpcClass = this.rpcClassPerPath[path];

        if (RpcClass) {
            return new RpcServlet(request, response, RpcClass, this.componentManager);
        }

        return new FileServlet(request, response); // No explicit filename.

    }

});

module.exports = Router;
