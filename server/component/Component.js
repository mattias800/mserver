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
        this.prepare();
        this.mcomponent = mcomponent({viewHtml : this.viewHtml, viewFromComponent : this.viewComponent});
        for (var id in this.children) {
            this.children[id]._prepare();
            var childComponent = this.children[id]._getMcomponent();
            if (!childComponent) throw "Child has no mcomponent object.";
            this.mcomponent.addChild(id, childComponent);
        }
    },

    prepare : function() {
        // Implemented by Component instances.
    },

    _afterPrepare : function() {
        this.afterPrepare();
        for (var id in this.children) {
            this.children[id]._afterPrepare();
        }
    },

    afterPrepare : function() {
        // Implemented by Component instances.
    },

    addChild : function(id, ComponentClass) {
        var obj = new ComponentClass({componentManager : this.componentManager, viewManager : this.viewManager});
        obj._setParent(this);
        this.children[id] = obj;
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
        console.log("OK RENDERING COMPONENT!");
        console.log("children=", this.mcomponent.getChildren());
        console.log("children.content=", this.mcomponent.getChildren().content);
        console.log("children.hasContent=", this.mcomponent.hasChild("content"));
        this.mcomponent.setModel(this.model);
        return this.mcomponent.render().html;
    }


});

module.exports = Component;
