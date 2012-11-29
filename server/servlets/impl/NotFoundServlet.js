var ServletBase = require("../ServletBase.js");

var NotFoundServlet = ServletBase.extend({

    execute : function(afterDone) {
        var servlet = new creos.FileServlet(this.request, this.response, "404.html");
        servlet.execute(function(result) {
            afterDone(result);
        });
    }

});

module.exports = NotFoundServlet;
