var mcomponent = require('../mcomponent.js');

var Component = Class.extend({

    init : function(args) {

        // Managers and router
        this.componentManager = args.componentManager;
        this.viewManager = this.componentManager.viewManager;
        this.router = this.componentManager.getRouter();

        // Tree
        this.children = {};
        this.parent = undefined;

        // Model
        this.model = undefined;

        // View
        this.viewPath = undefined;
        this.viewComponent = undefined;

        // Component
        this.mcomponent = undefined;

    },

    _prepare : function() {
        console.log("Component._prepare()");
        this.setModel(undefined);
        this.prepare();
        this.mcomponent = mcomponent({viewHtml : this.viewHtml, viewFromComponent : this.viewComponent});
        for (var id in this.children) {
            this.children[id]._prepare();
            this.mcomponent.addChild(id, this.children[id]._getMcomponent());
        }
    },

    prepare : function() {
        console.log("Component.prepare()");
        // Implemented by Component instances.
    },

    addChild : function(id, c) {
        this.children[id] = c;
        c._setParent(this);
    },

    _setParent : function(p) {
        this.parent = p;
    },

    setViewPath : function(path) {
        this.viewPath = path;
        this.viewComponent = this.viewManager.getViewForPath(this.viewPath);
    },

    setViewHtml : function(html) {
        this.viewHtml = html;
    },

    setModel : function(m) {
        this.model = m;
    },

    _getMcomponent : function() {
        return this.mcomponent;
    },

    _render : function() {
        this.mcomponent.setModel(this.model);
        return this.mcomponent.render().html;
    }


});

module.exports = Component;
