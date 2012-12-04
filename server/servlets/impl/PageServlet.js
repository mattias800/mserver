var ServletBase = require("../ServletBase.js");

var PageServlet = ServletBase.extend({

    init : function(request, response, PageClass, componentManager) {
        this._super(request, response);
        this.PageClass = PageClass;
        console.log("PageServlet servering", PageClass);
        this.page = new PageClass({componentManager : componentManager});
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
