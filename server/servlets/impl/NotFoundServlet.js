creos.NotFoundServlet = creos.ServletBase.extend({

    execute:function (afterDone) {
        var servlet = new creos.FileServlet(this.request, this.response, "404.html");
        servlet.execute(function (result) {
            afterDone(result);
        });
    }

});