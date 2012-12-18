var mcomponent = require('../mcomponent.js');

var Component = Class.extend({

    init : function(args) {

        /*
         var c = new MyComponent();
         page.addChild(c);
         c.addChild(otherComponent);

         var c = new MyComponent();
         c.addChild(otherComponent);
         page.addChild(c);

         Both should work!!
         */

        // Tree
        this.children = {};
        this.parent = undefined;

        // Model
        this.setModel(undefined);

        // View
        this.viewPath = undefined;
        this.viewComponent = undefined;

        // Component
        this.mcomponent = undefined;

    },

    _getComponentManager : function() {
        return this.componentManager;
    },

    _setComponentManager : function(cm) {
        this.componentManager = cm;
        this.viewManager = this.componentManager.viewManager;
        // Set for children as well.
        for (var id in this.children) {
            this.children[id]._setComponentManager(cm);
        }
    },

    _prepare : function() {
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

    addChild : function(id, component) {
        component._setParent(this);
        this.children[id] = component;
    },

    _setParent : function(p) {
        this.parent = p;
        this._setComponentManager(p._getComponentManager());
    },

    setViewPath : function(path) {
        this.viewPath = path;
        this.viewComponent = this.viewManager.getViewComponentForPath(this.viewPath);
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

    _beforeRender : function() {
        this.mcomponent.setModel(this.model);
        this.beforeRender();
        for (var id in this.children) {
            this.children[id]._beforeRender();
        }
    },

    beforeRender : function() {

    },

    log : function(s1, s2) {
        var args = [];
        args.push("Log:" + (this.type ? this.type : this.viewPath));
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            args.push(arg);
        }
        console.log.apply(this, args);
    }


});

module.exports = Component;
