var Component = require("./Component.js");

var Page = Component.extend({

    init : function(args) {
        this._super(args);

        this.manager = args.manager;
        this.router = this.manager.getRouter();

        // References
        this.jsReferenceList = [];
        this.cssReferenceList = [];

        if (this.path) this._setPath(this.path);
    },

    _setPath : function(path) {
        this.router.addPagePath(path, this);
    },

    addJsReference : function(ref) {
        this.jsReferenceList.push(ref);
    },

    addCssReference : function(ref) {
        this.cssReferenceList.push(ref);
    },

    _setParent : function(p) {
        throw "May not add Page as a child.";
    },

    render : function() {
        if (!this._getMcomponent()) throw "Trying to render Page, but Page has no mcomponent.";
        return this._getMcomponent().render().html;
    }

});

module.exports = Page;
