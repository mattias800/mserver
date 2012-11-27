var http = require('http');
var fs = require('fs');
var url = require("url");
var path = require("path");
//var Class = require("class.js");

var creos = {};
creos.debugEnabled = true;

function debugLog() {
    if (creos.debugEnabled) {
        console.log.apply(this, arguments);
    }
}

function includeJsFile(pathToJsFileXyzConfuse) {
    // pathToJsFileXyzConfuse since that variable will be in the scope of eval function.
    eval(fs.readFileSync(pathToJsFileXyzConfuse) + '');
}

function includeJsFiles(pathList) {
    for (var i = 0; i < pathList.length; i++) {
        includeJsFile(pathList[i]);
    }
}

var includes = [

    "Class.js",

    "server/ContentHandler.js",
    "server/Router.js",

    "server/servlets/ServletBase.js",
    "server/servlets/impl/FileServlet.js",
    "server/servlets/impl/RpcServlet.js",
    "server/servlets/impl/RpcErrorServlet.js",
    "server/servlets/impl/NotFoundServlet.js",
    "server/servlets/impl/NoSuchRpcServlet.js",

    "server/rpc/RpcResponse.js",
    "server/rpc/RpcActionBase.js",

    "root/rpc/GetBus.js",
    "root/rpc/GetGame.js",
    "root/rpc/StoreGame.js"

];

// file is included here:
includeJsFiles(includes);

var router = new creos.Router();
if (!router) throw "Unable to create Router.";

//  Get the environment variables we need.
var ipaddr = process.env.OPENSHIFT_INTERNAL_IP;
var port = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

http.createServer(function(request, response) {

    var pathName = url.parse(request.url).pathname;
    var servletToUse = router.createServlet(request, response, pathName);

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

