pages.TestPage = Page.extend({

    path : "/myPage",
    type : "TestPage",

    prepare : function() {
        this.setViewPath("root/pages/TestPage.html");

        this.setModel({name : "Jenny"});

        this.addChild("content", new components.TestComponent());
    },

    afterPrepare : function() {
    }

});
