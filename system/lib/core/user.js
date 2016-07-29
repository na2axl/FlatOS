+function($) {

    FlatOS.System.User = function (user) {
        this.user = user;
    };

    FlatOS.System.User.prototype.username = function() {
        var result;
        if (typeof this.user === 'undefined') {
            new FlatOS.Api.User(function(r) {
                result = r;
            }).getUsername();
        }
        else {
            result = this.user;
        }
        return result;
    };

    FlatOS.System.User.prototype.setUser = function(user) {
        new FlatOS.Api.User().setUser(user);
    };

    FlatOS.System.User.prototype.userDir = function(dir) {
        var result;
        new FlatOS.Api.User(function(r) {
            result = r;
        }).getUserDir(dir);
        return result;
    };

    FlatOS.System.User.prototype.listUserDir = function(dir) {
        var result;
        new FlatOS.Api.User(function(r) {
            result = r;
        }).listUserDir(dir);
        return result;
    };

    FlatOS.System.User.prototype.isSession = function() {
        var result;
        new FlatOS.Api.User(function(r) {
            result = r;
        }).isSession();
        return result;
    };

    FlatOS.System.User.prototype.userList = function() {
        var result;
        new FlatOS.Api.User(function(r) {
            result = r;
        }).getUserList();
        return result;
    };

    FlatOS.System.User.prototype.set_session_value = function(id, value) {
        new FlatOS.Api.User().set_session_value(id, value);
    };

    FlatOS.System.User.prototype.get_session_value = function(id) {
        var result;
        new FlatOS.Api.User(function(r) {
            result = r;
        }).get_session_value(id);
        return result;
    };

    FlatOS.System.User.prototype.getTruePath = function(path, user) {
        var result;
        new FlatOS.Api.User(function(r) {
            result = r;
        }).getTruePath(path, (user || this.user));
        return result;
    };

}(jQuery);