mserver.registerComponent({

    id : "TestComponent",

    init : function(args) {
        this.model = args.model;
    },

    prepare : function() {
        this.setModel(this.model);
    }

});
