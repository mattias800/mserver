var fs = require('fs');
var path = require("path");
var vm = require("vm");

var Class = require("resig-class");
var mserver = require("./server/mserver.js");

var server = new mserver.Server();
