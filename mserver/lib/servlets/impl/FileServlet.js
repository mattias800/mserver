var fs = require('fs');
var path = require("path");
var url = require("url");

var ServletBase = require("./../ServletBase.js");
var NotFoundServlet = require("./NotFoundServlet.js");
var ContentHandler = require("../../ContentHandler.js");

var FileServlet = ServletBase.extend({

    init : function(request, response, filename) {
        this._super(request, response);
        this.filename = filename;
    },

    fileExists : function(pathToFile, cb) {
        if (typeof fs.exists == "function") {
            fs.exists(pathToFile, cb);
        } else if (typeof path.exists) {
            path.exists(pathToFile, cb);
        } else {
            throw "Neither fs.exists nor path.exists are usable.";
        }
    },

    execute : function(afterDone) {
        var request = this.request;
        var response = this.response;
        var filename = this.filename;
        var that = this;

        var pathName = filename ?
            "root/static/" + filename : // Constructor got explicit filename.
            "root/static" + url.parse(request.url).pathname; // Resolve filename from URL path.

        var fullPath = pathName; //path.join(process.cwd(), pathName);

        this.fileExists(fullPath, function(exists) {
            if (!exists) {
                console.log("File does not exist, redirecting to NotFoundServlet: " + pathName);
                that.createRedirectionServlet(NotFoundServlet).execute(afterDone);
            } else {
                var contentHandler = new ContentHandler();

                fs.readFile(fullPath, "binary", function(err, file) {
                    if (err) {
                        console.log("File exists, but cannot read it: " + pathName);
                        afterDone({
                            code : 500,
                            header : {"Content-Type" : "text/plain"},
                            body : err + "\n"
                        });
                    } else {
                        afterDone({
                            code : 200,
                            header : contentHandler.getHeaderForPath(pathName),
                            fileBuffer : file
                        });
                    }

                });
            }
        });

    }

});

module.exports = FileServlet;