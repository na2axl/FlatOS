+function ($) {

    FlatOS.Api.File = function (callback) {
        this.api = new FlatOS.Api.Call({
            callAsync: true,
            api_class: 'File'
        }, callback);
    };

    FlatOS.Api.File.prototype.open = function (path) {
        this.api
            .setMethod('open')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.File.prototype.save = function (path, contents, append) {
        this.api
            .setMethod('save')
            .setArguments([path, contents, append])
            .call();
    };

}(jQuery);