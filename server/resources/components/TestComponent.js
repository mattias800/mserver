components.TestComponent = Component.extend({

    type : "TestComponent",

    prepare : function() {
        this.setViewPath("resources/components/TestComponent.html");

        this.setModel({user : {name : "mattias", age : 32}});
    }

});
