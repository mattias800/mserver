var ServletBase = Class.extend({

    init : function(request, response) {
        this.request = request;
        this.response = response;
        if (this.request == undefined) throw "Servlets constructor must get request as first parameter.";
        if (this.response == undefined) throw "Servlets constructor must get response as second parameter.";
    },

    getRequest : function() {
        return this.request;
    },

    getResponse : function() {
        return this.response;
    },

    execute : function() {
        throw "ServletBase subclasses must override writeResponse(response)";
    },

    redirectTo : function(servletClass, afterDone) {
        this.createRedirectionServlet(servletClass).execute(afterDone);
    },

    createRedirectionServlet : function(clazzConfuseXyz) {
        if (clazzConfuseXyz == undefined) {
            console.trace();
            throw "ServletBase.createRedirectionServlet() must get servlet Class as parameter. Got undefined.";
        }
        try {
            return new clazzConfuseXyz(this.request, this.response);
        } catch (e) {
            throw "Unable to instantiate servlet in ServletBase.createRedirectionServlet(): " + e;
        }
    }


});

module.exports = ServletBase;
