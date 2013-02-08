var fs = require('fs');
var path = require("path");
var vm = require("vm");
var Page = require("./component/Page.js");
var Rpc = require("./rpc/Rpc.js");
var Component = require("./component/Component.js");
var RpcResponse = require("./rpc/RpcResponse.js");

var ResourceLoader = Class.extend({

    init : function(args) {

        this.router = args.router;
        this.viewManager = args.viewManager;
        this.mserver = args.mserver;
        this.resourceDir = args.resourceDir;
        this.globals = args.globals;

        if (!this.router) throw "ComponentManager requires args.router.";
        if (!this.viewManager) throw "ComponentManager requires args.viewManager.";
        if (!this.resourceDir) throw "ComponentManager requires args.resourceDir.";

        this.sandbox = {};

        this.sandbox.Component = Component;
        this.sandbox.Page = Page;
        this.sandbox.RpcResponse = RpcResponse;
        this.sandbox.mserver = this.createInterface();

        this.sandbox.console = console;
        this.sandbox.require = require;
        this.sandbox.router = this.router;
        this.sandbox.components = {};
        this.sandbox.globals = this.globals;

        this.context = vm.createContext(this.sandbox);

        this.fileList = this.findAllResourcePaths(this.resourceDir);
        this.includeAllFiles();

    },

    createInterface : function() {
        var that = this;
        return {
            registerPage : function(pageArgs) {
                that.registerPage(pageArgs)
            },
            registerRpc : function(rpcArgs) {
                that.registerRpc(rpcArgs)
            },
            registerWebSocket : function(webSocketArgs) {
                that.registerWebSocket(webSocketArgs)
            },
            registerManager : function(managerArgs) {
                that.registerManager(managerArgs)
            }
        };
    },

    registerManager : function(managerArgs) {

    },

    validatePageArgs : function(pageArgs) {
        if (pageArgs.id == undefined) throw "Page has no id specified.";
        if (pageArgs.path == undefined) throw "Page (id=" + pageArgs.id + ") has no path specified.";
    },

    registerPage : function(pageArgs) {
        var path = pageArgs.path;
        try {
            this.validatePageArgs(pageArgs);
        } catch (e) {
            throw "Trying to register page at path=" + path + " but: " + e;
        }
        var PathClass = Page.extend(pageArgs);
        this.router.registerPageAtPath(PathClass, path);
        console.log("Registered page at " + path);
    },

    validateRpcArgs : function(rpcArgs) {
        if (rpcArgs.id == undefined) throw "RPC has no id specified.";
        if (rpcArgs.path == undefined) throw "RPC (id=" + pageArgs.id + ") has no path specified.";
    },

    registerRpc : function(rpcArgs) {
        var path = rpcArgs.path;
        try {
            this.validateRpcArgs(rpcArgs);
        } catch (e) {
            throw "Trying to register RPC at path=" + path + " but: " + e;
        }
        var RpcClass = Rpc.extend(rpcArgs);
        this.router.registerRpcAtPath(RpcClass, path);
        console.log("Registered RPC at " + path);
    },

    validateWebSocketArgs : function(webSocketArgs) {
        if (webSocketArgs.id == undefined) throw "WebSocket has no id specified.";
        if (webSocketArgs.path == undefined) throw "WebSocket (id=" + pageArgs.id + ") has no path specified.";
    },

    registerWebSocket : function(webSocketArgs) {
        var path = webSocket.path;
        try {
            this.validateWebSocketArgs(webSocketArgs);
        } catch (e) {
            throw "Trying to register WebSocket at path=" + path + " but: " + e;
        }
        var WebSocketClass = WebSocket.extend(rpcArgs);
        this.router.registerWebSocketAtPath(RpcClass, path);
        console.log("Registered WebSocket at " + path);
    },

    getRouter : function() {
        return this.router;
    },

    getSandBox : function() {
        return this.sandbox;
    },

    findAllResourcePaths : function(dir) {
        var that = this;
        var fileList = [];
        var file;

        var files = fs.readdirSync(dir);

        for (var i = 0; i < files.length; i++) {
            file = files[i];
            var fullFilePath = dir + "/" + file;

            var stat = fs.statSync(fullFilePath);
            if (stat.isDirectory()) {
                var childFiles = this.findAllResourcePaths(fullFilePath);
                for (var j = 0; j < childFiles.length; j++) {
                    fileList.push(childFiles[j]);

                }
            } else if (stat.isFile()) {
                if (that.fileNameIsJsFile(file)) {
                    fileList.push(fullFilePath);
                }
            }
        }

        return fileList;
    },

    includeAllFiles : function() {
        for (var i = 0; i < this.fileList.length; i++) {
            var file = this.fileList[i];
            this.includeFile(file);
        }
    },

    includeFile : function(file) {
        var code = fs.readFileSync(fs.realpathSync(file), "utf8");
        vm.runInContext(code, this.context, file);
    },

    fileNameIsJsFile : function(file) {
        var spl = file.split(".");
        if (spl[1] == "js") {
            return true;
        } else {
            return false;
        }

    }

});

module.exports = ResourceLoader;

