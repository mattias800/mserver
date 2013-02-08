mserver.registerPage(
    {

        id : "TestPage2",
        path : "/myPage2",

        prepare : function() {
            this.setViewPath("resources/pages/TestPage2.html");
        }

    }
);
