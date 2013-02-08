var ContentHandler = Class.extend({

    getHeaderForPath : function(path) {
        var s = path.split(".");
        var ext = s[s.length - 1];
        return this.getHeaderForExtension(ext);
    },

    getHeaderForExtension : function(ext) {
        switch (ext) {

            case "ico":
                return {
                    "Content-Type" : "image/ico"
                };

            case "htm":
                return {
                    "Content-Type" : "text/html"
                };

            case "html":
                return {
                    "Content-Type" : "text/html"
                };

            case "txt":
                return {
                    "Content-Type" : "text/plain"
                };

            case "js":
                return {
                    "Content-Type" : "application/javascript"
                };

            case "css":
                return {
                    "Content-Type" : "text/css"
                };

            case "mp3":
                return {
                    "Content-Type" : "audio/mpeg, audio/x-mpeg, audio/x-mpeg-3, audio/mpeg3"
                };

            default:
                return {
                    "Content-Type" : "application/octet-stream"
                };
        }
    }

});

module.exports = ContentHandler;
