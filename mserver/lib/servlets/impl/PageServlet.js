var ServletBase = require("../ServletBase.js");


var PageServlet = ServletBase.extend({

    init : function(request, response, PageClass, componentManager) {
        this._super(request, response);
        if (PageClass == undefined) throw "PageServlet initialization error, got undefined PageClass.";
        this.PageClass = PageClass;
        this.pageObj = new PageClass({resourceLoader : componentManager});
    },

    execute : function(afterDone) {
        var start = new Date();
        this.pageObj._prepare();
        this.pageObj._afterPrepare();
        var body = this.pageObj.render();
        afterDone({
            code : 200,
            header : {"Content-Type" : "text/html"},
            body : body + "\n"
        });
        var end = new Date();
        var time = end.getTime() - start.getTime();
        console.log("Served page in " + time + " ms.")
    }

});

module.exports = PageServlet;
