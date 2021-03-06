var fs = require('fs');
var path = require("path");
var url = require("url");

var ServletBase = require("./../ServletBase.js");
var NotFoundServlet = require("./NotFoundServlet.js");
var ContentHandler = require("../../ContentHandler.js");

var FileServlet = ServletBase.extend({

    init : function(request, response, staticDir, filename) {
        this._super(request, response);
        this.staticDir = staticDir;
        this.filename = filename;
        this.fullFilePath = this.staticDir + "/" + filename;
        if (!this.staticDir) throw "FileServlet must get staticDir as argument.";
        if (!this.filename) throw "FileServlet must get filename as argument.";
    },

    fileExists : function(callback) {
        var existObj;
        if (typeof fs.exists == "function") {
            existObj = fs;
        } else if (typeof path.exists) {
            existObj = path;
        } else {
            throw "Neither fs.exists nor path.exists are usable.";
        }

        return existObj.exists(this.fullFilePath, function(exists) {
            if (exists) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },

    _fileExists : function(pathToFile, cb) {
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


        var fullPath = this.fullFilePath; //path.join(process.cwd(), pathName);

        this._fileExists(fullPath, function(exists) {
            if (!exists) {
                console.log("File does not exist, redirecting to NotFoundServlet: " + fullPath);
                that.createRedirectionServlet(NotFoundServlet).execute(afterDone);
            } else {
                var contentHandler = new ContentHandler();

                fs.readFile(fullPath, "binary", function(err, file) {
                    if (err) {
                        console.log("File exists, but cannot read it: " + fullPath);
                        afterDone({
                            code : 500,
                            header : {"Content-Type" : "text/plain"},
                            body : err + "\n"
                        });
                    } else {
                        afterDone({
                            code : 200,
                            header : contentHandler.getHeaderForPath(fullPath),
                            fileBuffer : file
                        });
                    }

                });
            }
        });

    }

});

module.exports = FileServlet;
