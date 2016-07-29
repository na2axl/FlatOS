+function ($) {

    FlatOS.System.File = function () {

    };

    FlatOS.System.File.prototype.open = function (path) {
        var result;
        new FlatOS.Api.File(function(r) {
            result = r;
        }).open(path);
        return result;
    };

    FlatOS.System.File.prototype.save = function (path, contents, append) {
        var result;
        new FlatOS.Api.File(function(r) {
            result = r;
        }).save(path, contents, append);
        return result;
    };

}(jQuery);