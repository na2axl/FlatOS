+function($) {

    FlatOS.Api.User = function(callback) {
        this.api = new FlatOS.Api.Call({
            api_class: 'User'
        }, callback);
    };

    FlatOS.Api.User.prototype.setUser = function(user) {
        this.api
            .setMethod('setUser')
            .setArguments([user])
            .call();
    };

    FlatOS.Api.User.prototype.getUsername = function() {
        this.api
            .setMethod('getUsername')
            .setArguments([])
            .call();
    };

    FlatOS.Api.User.prototype.getUserList = function() {
        this.api
            .setMethod('getUserList')
            .setArguments([])
            .call();
    };

    FlatOS.Api.User.prototype.isSession = function() {
        this.api
            .setMethod('isSession')
            .setArguments([])
            .call();
    };

    FlatOS.Api.User.prototype.getUserDir = function(dir) {
        this.api
            .setMethod('getUserDir')
            .setArguments([dir])
            .call();
    };

    FlatOS.Api.User.prototype.listUserDir = function(dir) {
        this.api
            .setMethod('listUserDir')
            .setArguments([dir])
            .call();
    };

    FlatOS.Api.User.prototype.set_session_value = function(id, value) {
        this.api
            .setMethod('set_session_value')
            .setArguments([id, value])
            .call();
    };

    FlatOS.Api.User.prototype.get_session_value = function(id) {
        this.api
            .setMethod('get_session_value')
            .setArguments([id])
            .call();
    };

    FlatOS.Api.User.prototype.getTruePath = function(path, user) {
        this.api
            .setMethod('getTruePath')
            .setArguments([path, user])
            .call();
    };

}(jQuery);