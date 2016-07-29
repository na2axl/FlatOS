+function ($) {

    FlatOS.Api.UserConfig = function(callback) {
        this.api  = new FlatOS.Api.Call({
            api_class: 'UserConfig'
        }, callback);
    };

    FlatOS.Api.UserConfig.prototype.getConfig = function(file, required, user) {
        this.api
            .setMethod('getConfig')
            .setArguments([file, required, user])
            .call();
    };

}(jQuery)