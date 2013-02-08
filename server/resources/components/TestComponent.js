components.TestComponent = Component.extend({

    type : "TestComponent",

    prepare : function() {
        this.setViewPath("root/components/TestComponent.html");

        this.setModel({user : {name : "mattias", age : 32}});
    }

});
