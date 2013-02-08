mserver.registerPage(
    {
        id : "TestPage",
        path : "/myPage",

        prepare : function() {
            this.setViewPath("resources/pages/TestPage.html");

            this.setModel({name : "Jenny"});

            var model = {user : {name : "mattias", age : 32}};

            this.addChild("content", new components.TestComponent({model : model}));
        },

        afterPrepare : function() {
        }

    }
);
