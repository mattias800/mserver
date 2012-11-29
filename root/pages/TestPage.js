var TestComponent = undefined;

var TestPage = Page.extend({

    prepare : function() {
        this.setView("root/pages/TestPage.html");

        this.addChild("content", new TestComponent());
    }

});

module.exports = TestPage;

