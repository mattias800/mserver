pages.TestPage = Page.extend({

    prepare : function() {
        this.setView("root/pages/TestPage.html");

        this.addChild("content", new TestComponent());
    }

});
