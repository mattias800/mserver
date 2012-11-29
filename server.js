var fs = require('fs');
var path = require("path");
var vm = require("vm");

var Class = require("resig-class");
var mserver = require("./server/mserver.js");

function includeJsFile(pathToJsFileXyzConfuse) {
    // pathToJsFileXyzConfuse since that variable will be in the scope of eval function.
    eval(fs.readFileSync(pathToJsFileXyzConfuse, 'utf8') + '');
}

function includeJsFiles(pathList) {
    for (var i = 0; i < pathList.length; i++) {
        includeJsFile(pathList[i]);
    }
}

var includes = [

    // Pages
    "root/components/TestComponent.js",
    "root/pages/TestPage.js"
];

// file is included here:
//includeJsFiles(includes);

var server = new mserver.Server();
