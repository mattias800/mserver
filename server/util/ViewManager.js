var fs = require('fs');

var mcomponent = require('../mcomponent.js');

var ViewManager = Class.extend({

    init : function(args) {

        // A cache with mcomponent objects per view path. These have no models, only a view that is compiled.
        // We can import the compiled view when creating new components.
        this.cache = {};
    },

    getViewForPath : function(path) {
        if (!this.cache[path]) this.addView(path);
        return this.cache[path];
    },

    addView : function(path) {
        var viewHtml = this._readViewFile(path);
        if (!viewHtml) throw "Reading view but it seems to be empty: " + path;
        var component = mcomponent({viewHtml : viewHtml});
        this.cache[path] = component;
    },

    _readViewFile : function(file) {
        console.log("Reading view from disk: " + file);
        return fs.readFileSync(file, 'utf8')
    }


});

module.exports = ViewManager;