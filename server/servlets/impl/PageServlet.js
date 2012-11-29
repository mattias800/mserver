var ServletBase = require("../ServletBase.js");

var PageServlet = ServletBase.extend({

    init : function(request, response, page) {
        this._super(request, response);
        this.page = page;
    },


    execute : function(afterDone) {
        this.page._prepare();
        var body = this.page.render();
        afterDone({
            code : 200,
            header : {"Content-Type" : "text/html"},
            body : body + "\n"
        });

    }
});

module.exports = PageServlet;
