pages.TestPage = Page.extend({

    path : "/myPage",

    prepare : function() {
        this.setView("root/pages/TestPage.html");

        this.addChild("content", new TestComponent());
    }

});
