pages.TestPage = Page.extend({

    path : "/myPage",

    prepare : function() {
        this.setViewPath("root/pages/TestPage.html");

        this.addChild("content", components.TestComponent);
    },

    afterPrepare : function() {
    }

});
