+function ($) {

    FlatOS.System.UserConfig = function(user) {
        this.user = user || new FlatOS.System.User().username();
    };

    FlatOS.System.UserConfig.prototype.getConfig = function(file, required, user) {
        var result;
        user = user || this.user;
        new FlatOS.Api.UserConfig(function(r) {
            result = r;
        }).getConfig(file, required, user);
        return result;
    };

}(jQuery);