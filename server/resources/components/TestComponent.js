mserver.registerComponent({

    id : "TestComponent",

    component : {

        init : function(args) {
            this.model = args.model;
        },

        prepare : function() {
            this.setViewPath("resources/components/TestComponent.html");

            this.setModel(this.model);
        }
    }

});
