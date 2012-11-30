var Component = require("./Component.js");

var Page = Component.extend({

    init : function() {
        this._super();

        // References
        this.jsReferenceList = [];
        this.cssReferenceList = [];

        if (this.path) this._setPath(this.path);
    },

    _setPath : function(path) {
        // TODO: router is not defined. Pass it as argument to constructor?
        router.addPagePath(path, this);
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
