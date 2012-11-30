var fs = require('fs');
var path = require("path");
var vm = require("vm");

var Includer = Class.extend({

    init : function() {
        this.componentsDirectory = "./root/components/";
        this.pagesDirectory = "./root/pages/";
        this.fileList = this.findAllPageJsPaths();
        this.classes = {};

        this.sandbox = {};
        this.sandbox.Component = require("../component/Component.js");
        this.sandbox.Page = require("../component/Page.js");
        this.sandbox.console = console;
        this.sandbox.pages = {};
        this.sandbox.components = {};
        this.context = vm.createContext(this.sandbox);

        this.includeAllFiles();

    },

    getSandBox : function() {
        return this.sandbox;
    },

    findAllPageJsPaths : function() {
        var that = this;
        var fileList = [];
        var file;

        var files = fs.readdirSync(this.componentsDirectory);
        for (var i = 0; i < files.length; i++) {
            file = files[i];
            if (that.fileNameIsJsFile(file)) {
                fileList.push(that.componentsDirectory + file);
            }
        }

        files = fs.readdirSync(this.pagesDirectory);

        for (var i = 0; i < files.length; i++) {
            file = files[i];
            if (that.fileNameIsJsFile(file)) {
                fileList.push(that.pagesDirectory + file);
            }
        }

        return fileList;
    },

    includeAllFiles : function() {
        for (var i = 0; i < this.fileList.length; i++) {
            var file = this.fileList[i];
            this.includeFile(file);
        }
    },

    includeFile : function(file) {
        var code = fs.readFileSync(fs.realpathSync(file), "utf8");
        vm.runInContext(code, this.context, file);
    },

    fileNameIsJsFile : function(file) {
        var spl = file.split(".");
        if (spl[1] == "js") {
            return true;
        } else {
            return false;
        }

    }

});

module.exports = Includer;

