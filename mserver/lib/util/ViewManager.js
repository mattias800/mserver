var fs = require('fs');

var mcomponent = require('../mcomponent.js');

var ViewManager = Class.extend({

    init : function(args) {

        var that = this;

        // A cache with mcomponent objects per view path. These have no models, only a view that is compiled.
        // We can import the compiled view when creating new components.
        this.cache = {};

        if (args && args.autoRefreshResources) {
            setInterval(function() {
                that.cache = {};
            }, args.autoRefreshResources);
        }
    },

    getViewComponentForPath : function(path) {
        if (!this.cache[path]) this.addView(path);
        return this.cache[path];
    },

    addView : function(path) {
        var viewHtml = this._readViewFile(path);
        if (!viewHtml) throw "Reading view but it seems to be empty: " + path;
        this.cache[path] = mcomponent({viewHtml : viewHtml});
    },

    _readViewFile : function(file) {
        console.log("Reading view from disk: " + file);
        return fs.readFileSync(file, 'utf8')
    }


});

module.exports = ViewManager;
