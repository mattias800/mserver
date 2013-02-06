// test/main.js
var should = require('should');
var mserver = require('../server/main.js');

describe("mserver", function() {
    describe("object", function() {
        it("exists", function() {
            should.exist(mserver);
            should.exist(mserver.startServer);
        });
    });
    describe("with no arguments", function() {
        it("can start", function() {

        });
    });
});


var e = {
    "name" : "mserver",
    "version" : "0.0.0",
    "description" : "A simple web application framework for Node.",
    "main" : "server/main.js",
    "directories" : {
        "test" : "test"
    },
    "dependencies" : {
        "resig-class" : "~0.1.0"
    },
    "devDependencies" : {
        // Use any version
        "mocha" : "",
        "should" : ""
    },
    "scripts" : {
        "test" : "mocha test/*.js",
        "start" : "node server.js"
    },
    "repository" : {
        "type" : "git",
        "url" : "/Users/mono/Dropbox/repos/mserver/"
    },
    "keywords" : [
        "mserver",
        "mcomponent"
    ],
    "author" : "Mattias Andersson",
    "license" : "BSD",
    "readmeFilename" : "README"
}
