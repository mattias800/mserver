var http = require('http');
var url = require("url");

var Class = require("resig-class");

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

var Server = Class.extend({

    init : function() {

        var that = this;

        this.router = new Router({mserver : that});
        if (!this.router) throw "Unable to create Router.";

        //  Get the environment variables we need.
        var ipaddr = process.env.OPENSHIFT_INTERNAL_IP || "127.0.0.1";
        var port = process.env.OPENSHIFT_INTERNAL_PORT || 8090;

        http.createServer(
            function(request, response) {

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

            }).listen(port, ipaddr);

        console.log('Started mserver at ' + ipaddr + ":" + port);


    }

});

var startServer = function() {
    return new Server();
};

module.exports.startServer = startServer;
module.exports.Component = Component;
module.exports.Page = Page;
module.exports.Rpc = Rpc;
module.exports.RpcResponse = RpcResponse;

