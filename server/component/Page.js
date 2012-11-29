var Component = require("./Component.js");

var Page = Component.extend({

    init : function() {
        this._super();

        // References
        this.jsReferenceList = [];
        this.cssReferenceList = [];

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
