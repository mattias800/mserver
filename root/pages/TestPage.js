pages.TestPage = Page.extend({

    path : "/myPage",

    prepare : function() {
        this.setViewPath("root/pages/TestPage.html");

        this.addChild("content", new components.TestComponent());
    },

    afterPrepare : function() {
    }

});
