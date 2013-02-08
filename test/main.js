// test/main.js
var should = require('should');
var mserver = require('../server/main.js');

describe("mserver", function() {
    describe("object", function() {
        it("exists", function() {
            should.exist(mserver);
            should.exist(mserver.startServer);
        });
    });
    describe("with no arguments", function() {
        it("can start", function() {

        });
    });
});

