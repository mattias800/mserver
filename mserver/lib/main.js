var http = require('http');
var url = require("url");
var fs = require("fs");

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
    if (dir.substr(dir.length - 1) != "/") {
        throw "Must end with /";
    }
    if (dir.substr(0, 2) != "./" && dir.substr(0, 3) != "../") {
        throw "Must start start with ./ or ../";
    }

    if (!fs.existsSync(dir)) {
        throw "Specified directory doesn't exist.";
    }

    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        throw "Specified path is not a directory."
    }
};

var Server = Class.extend({

    init : function(args) {

        var resourceDir = args && args.resourceDir ? args.resourceDir : "./resource/";
        var staticDir = args && args.staticDir ? args.staticDir : "./static/";
        var globals = args.globals;

        try {
            validateDir(resourceDir);
        } catch (e) {
            throw "Invalid resourceDir " + resourceDir + " : " + e;
        }
        try {
            validateDir(staticDir);
        } catch (e) {
            throw "Invalid staticDir " + staticDir + " : " + e;
        }

        var that = this;

        this.router = new Router({
            mserver : that,
            resourceDir : resourceDir,
            staticDir : staticDir,
            globals : globals
        });

        if (!this.router) throw "Unable to create Router.";

        //  Get the environment variables we need.
        var ipaddr = process.env.OPENSHIFT_INTERNAL_IP || "127.0.0.1";
        var port = process.env.OPENSHIFT_INTERNAL_PORT || 8090;

        http.createServer(
            function(request, response) {

                try {
                    var pathName = url.parse(request.url).pathname;
                    var servletToUse = that.router.createServlet(request, response, pathName);

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

                        console.log("Served response for: " + pathName);
                    });

                } catch (e) {
                    console.error("Error responding: " + e.toString());
                }

            }).listen(port, ipaddr);

        console.log('Started mserver at ' + ipaddr + ":" + port);


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

