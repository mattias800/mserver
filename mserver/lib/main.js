var http = require('http');
var url = require("url");

var Class = require("./support/resig-class/");

var Router = require("./Router.js");
var Component = require("./component/Component.js");
var Page = require("./component/Page.js");
var Rpc = require("./rpc/Rpc.js");
var RpcResponse = require("./rpc/RpcResponse.js");

if (Router == undefined) throw "Unable to include Router.";
if (Component == undefined) throw "Unable to include Component.";
if (Page == undefined) throw "Unable to include Page.";
if (Rpc == undefined) throw "Unable to include Rpc.";
if (RpcResponse == undefined) throw "Unable to include RpcResponse.";

var validateDir = function(dir) {
    // TODO: Check that dir exists.
};

var Server = Class.extend({

    init : function(args) {

        var that = this;

        var resourceDir = args && args.resourceDir ? args.resourceDir : "./resource/";
        var staticDir = args && args.staticDir ? args.staticDir : "./static/";
        var globals = args.globals;
        var autoRefreshResources = args && args.autoRefreshResources ? args.autoRefreshResources : undefined;

        validateDir(resourceDir);
        validateDir(staticDir);

        if (typeof autoRefreshResources !== "undefined" && typeof autoRefreshResources !== "number") throw "autoRefreshResources argument must be a number, if specified.";
        if (autoRefreshResources) {
            if (autoRefreshResources < 500) {
                autoRefreshResources = 500;
                console.log("autoRefreshResources limited to once per 500 ms.");
            }
        }

        this.router = undefined;

        //  Get the environment variables we need.
        var ipaddr = process.env.OPENSHIFT_INTERNAL_IP || "0.0.0.0";
        var port = process.env.OPENSHIFT_INTERNAL_PORT || 8090;

        var httpServer = http.createServer(
            function(request, response) {

                var pathName = url.parse(request.url).pathname;

                that.router.createServlet(request, response, pathName, function(servletToUse) {

                    var start = new Date();

                    servletToUse.execute(function(result) {

                        response.writeHead(result.code ? result.code : 200, result.header);

                        if (result.fileBuffer !== undefined) {
                            response.write(result.fileBuffer, "binary");
                            response.end();
                        } else {
                            var bodyToSend = result.body;
                            if (typeof bodyToSend == "object") {
                                bodyToSend = JSON.stringify(bodyToSend);
                            }
                            response.write(bodyToSend);
                            response.end();
                        }

                        var end = new Date();
                        var time = end.getTime() - start.getTime();
                        console.log("Served response in " + time + " ms for: " + pathName);
                    });

                });

            }).listen(port, ipaddr);

        console.log('Started mserver at ' + ipaddr + ":" + port);

        this.router = new Router({
            httpServer : httpServer,
            mserver : that,
            resourceDir : resourceDir,
            staticDir : staticDir,
            globals : globals,
            autoRefreshResources : autoRefreshResources
        });

        if (!this.router) throw "Unable to create Router.";

    }

});

var startServer = function(args) {
    return new Server(args);
};

module.exports.startServer = startServer;
module.exports.Component = Component;
module.exports.Page = Page;
module.exports.Rpc = Rpc;
module.exports.RpcResponse = RpcResponse;

