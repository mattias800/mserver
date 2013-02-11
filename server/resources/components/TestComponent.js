mserver.registerComponent({

    id : "TestComponent",

    init : function(args) {
        this.model = args.model;
    },

    prepare : function() {
        //this.setViewPath("resources/components/TestComponent.html");
        //this.setDefaultView();

        this.setModel(this.model);
    }

});
