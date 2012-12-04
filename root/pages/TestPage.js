pages.TestPage = Page.extend({

    path : "/myPage",

    prepare : function() {
        this.setViewPath("root/pages/TestPage.html");

        this.addChild("content", components.TestComponent);
    },

    afterPrepare : function() {
        console.log("AAAAFTER PREPARE for page");
        console.log("this.children", this.children);
        console.log("this.mcomponent", this.mcomponent);
        console.log('this.mcomponent.hasChild("content")', this.mcomponent.hasChild("content"));
        console.log("this.mcomponent.getChildren()", this.mcomponent.getChildren());
        console.log("render result:");
        console.log(this.mcomponent.render().html);
    }

});
