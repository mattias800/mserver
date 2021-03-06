var fs = require('fs');
var path = require("path");
var vm = require("vm");
var Page = require("./component/Page.js");
var Rpc = require("./rpc/Rpc.js");
var Component = require("./component/Component.js");
var RpcResponse = require("./rpc/RpcResponse.js");
var WebSocketServer = require("./websocket/WebSocketServer.js");

var ResourceLoader = Class.extend({

    init : function(args) {
        var that = this;

        this.httpServer = args.httpServer;
        this.router = args.router;
        this.viewManager = args.viewManager;
        this.mserver = args.mserver;
        this.resourceDir = args.resourceDir;
        this.globals = args.globals;
        this.managers = {};
        this.components = {};
        this.autoRefreshResources = args.autoRefreshResources;

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
        this.sandbox.components = this.components;
        this.sandbox.globals = this.globals;
        this.sandbox.managers = this.managers;

        this.context = vm.createContext(this.sandbox);

        this.currentIncludeDir = undefined;
        this.currentIncludeFile = undefined;

        this.logRegistrations = true;

        that.fileList = that.findAllResourcePaths(that.resourceDir);
        that.includeAllFiles();

        if (this.autoRefreshResources) {
            this.logRegistrations = false;
            setInterval(function() {
                that.router.resetAllPaths();
                that.fileList = that.findAllResourcePaths(that.resourceDir);
                that.includeAllFiles();
            }, this.autoRefreshResources);
        }

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
            },
            registerComponent : function(componentArgs) {
                that.registerComponent(componentArgs)
            }
        };
    },

    registerManager : function(managerArgs) {
        if (!managerArgs.id) throw "Trying to register manager, but no id was specified. Id is required.";
        this.managers[managerArgs.id] = managerArgs;
        if (this.logRegistrations) console.log("Registered manager with id=" + managerArgs.id);
    },

    registerComponent : function(componentArgs) {
        if (!componentArgs.id) throw "Trying to register component, but no id was specified. Id is required.";
        componentArgs.componentPath = this.currentIncludeDir;
        componentArgs.componentFileName = this.currentIncludeFile;
        componentArgs.defaultViewFileName = this.getViewFileName(this.currentIncludeDir, this.currentIncludeFile);
        this.components[componentArgs.id] = Component.extend(componentArgs);
        if (this.logRegistrations) console.log("Registered component with id=" + componentArgs.id);
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
        pageArgs.componentPath = this.currentIncludeDir;
        pageArgs.componentFileName = this.currentIncludeFile;
        pageArgs.defaultViewFileName = this.getViewFileName(this.currentIncludeDir, this.currentIncludeFile);
        var PathClass = Page.extend(pageArgs);
        this.router.registerPageAtPath(PathClass, path);
        if (this.logRegistrations) console.log("Registered page at " + path);
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
        if (this.logRegistrations) console.log("Registered RPC at " + path);
    },

    validateWebSocketArgs : function(webSocketArgs) {
        if (webSocketArgs.id == undefined) throw "WebSocket has no id specified.";
        if (webSocketArgs.path == undefined) throw "WebSocket (id=" + pageArgs.id + ") has no path specified.";
    },

    registerWebSocket : function(webSocketArgs) {
        try {
            this.validateWebSocketArgs(webSocketArgs);
        } catch (e) {
            throw "Trying to register WebSocketServer at path=" + path + " but: " + e;
        }
        var path = webSocketArgs.path;
        var WebSocketServerClass = WebSocketServer.extend(webSocketArgs);

        var webSocketServerObject = new WebSocketServerClass({
            httpServer : this.httpServer
        });

        this.router.registerWebSocketAtPath(webSocketServerObject, path);
        if (this.logRegistrations) console.log("Registered WebSocket at " + path);
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
            var fullFilePath = dir + file;

            var stat = fs.statSync(fullFilePath);
            if (stat.isDirectory()) {
                var childFiles = this.findAllResourcePaths(fullFilePath + "/");
                for (var j = 0; j < childFiles.length; j++) {
                    fileList.push(childFiles[j]);

                }
            } else if (stat.isFile()) {
                if (that.fileNameIsJsFile(file)) {
                    fileList.push({path : dir, file : file});
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

    includeFile : function(fileObj) {
        var file = fileObj.path + "/" + fileObj.file;
        var code = fs.readFileSync(fs.realpathSync(file), "utf8");
        this.currentIncludeDir = fileObj.path;
        this.currentIncludeFile = fileObj.file;
        vm.runInContext(code, this.context, file);
    },

    /**
     *
     * @param dir Ex: resources/components/
     * @param file Ex: MainComponent.js
     */
    getViewFileName : function(dir, file) {
        var files = file.split(".");
        files[files.length - 1 ] = "html";
        return dir + files.join(".");
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

