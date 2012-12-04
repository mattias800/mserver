pages.TestPage = Page.extend({

    path : "/myPage2",

    prepare : function() {
        this.setView("root/pages/TestPage2.html");
    }

});
