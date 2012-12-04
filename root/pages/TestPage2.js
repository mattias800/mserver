pages.TestPage = Page.extend({

    path : "/myPage2",

    prepare : function() {
        this.setViewPath("root/pages/TestPage2.html");
    }

});
