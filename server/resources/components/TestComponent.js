mserver.registerComponent({

    id : "TestComponent",

    component : {

        prepare : function() {
            this.setViewPath("resources/components/TestComponent.html");

            var model = {user : {name : "mattias", age : 32}};

            this.setModel(model);
        }
    }

});
