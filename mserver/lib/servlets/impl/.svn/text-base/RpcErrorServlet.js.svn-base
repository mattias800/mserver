creos.RpcErrorServlet = creos.ServletBase.extend({

    execute:function (afterDone) {
        var servlet = new creos.FileServlet(this.request, this.response, "error.html");
        servlet.execute(function (result) {
            afterDone(result);
        });
    }

});
