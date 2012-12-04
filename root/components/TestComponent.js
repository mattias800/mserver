components.TestComponent = Component.extend({

    prepare : function() {
        this.setView("root/components/TestComponent.html");

        this.setModel({user : {name : "mattias", age : 32}});
    }

});
