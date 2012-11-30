var Page = require("../../server/mserver.js").Page;
var TestComponent = require("../components/TestComponent.js").Component;

var TestPage = Page.extend({

    prepare : function() {
        this.setView("root/pages/TestPage.html");

        this.addChild("content", new TestComponent());
    }

});

module.exports = TestPage;

