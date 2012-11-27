creos.NoSuchRpcServlet = creos.ServletBase.extend({

    execute : function(afterDone) {
        this.redirectTo(creos.NotFoundServlet, afterDone);
    }
});
