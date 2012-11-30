var http = require('http');
var url = require("url");

var Class = require("resig-class");

var Router = require("./Router.js");
var Component = require("./component/Component.js");
var Page = require("./component/Page.js");

var Server = Class.extend({

    init : function() {

        var that = this;

        this.router = new Router();
        if (!this.router) throw "Unable to create Router.";

        //  Get the environment variables we need.
        var ipaddr = process.env.OPENSHIFT_INTERNAL_IP;
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

        console.log('Started Creos server at ' + ipaddr + ":" + port);


    }

});

module.exports.Server = Server;
module.exports.Component = Component;
module.exports.Page = Page;

