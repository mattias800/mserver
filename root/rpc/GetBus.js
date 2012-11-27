creos.rpc.GetBus = creos.RpcActionBase.extend({

    execute:function (urlParameter, afterDone) {

        console.log("Getting bus...");

        var options = {
            host:'api.vasttrafik.se',
            path:'/bin/rest.exe/v1/departureBoard?authKey=6511154616&format=json&id=9021014002130000'
        };

        http.request(options,function (response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
                console.log("Getting bus done!");

                str = str
                    .replace("Ã¥", "å")
                    .replace("Ã¶", "ö")
                ;

                var model = JSON.parse(str);

                afterDone({
                    response:creos.RpcResponse.createOkWithModel({departureInfo:model})
                });

            });

        }).end();

    }

});