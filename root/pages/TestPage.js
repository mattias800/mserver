pages.TestPage = Page.extend({

    prepare : function() {
        this.setPath("/myPage");

        this.setView("root/pages/TestPage.html");

        this.addChild("content", new TestComponent());
    }

});
