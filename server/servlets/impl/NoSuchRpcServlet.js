var ServletBase = require("../ServletBase.js");

NoSuchRpcServlet = ServletBase.extend({

    execute : function(afterDone) {
        this.redirectTo(creos.NotFoundServlet, afterDone);
    }
});

module.exports = NoSuchRpcServlet;
