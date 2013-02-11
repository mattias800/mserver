var ComponentBase = require("./ComponentBase.js");

var Component = ComponentBase.extend({

    init : function(args) {
    },

    _prepare : function() {
        this.setDefaultView();
        this._super();
    }

});

module.exports = Component;
