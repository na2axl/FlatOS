+function($) {

    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if (options.cache) {
            var complete = originalOptions.success || $.noop,
                url = originalOptions.url;

            options.cache = false;

            options.beforeSend = function () {
                console.log('-> Loading "' + url + '"');
                if (F.Cache.Ajax.exist(url)) {
                    console.log('   --> Loaded from cache: "' + url + '"');
                    complete(F.Cache.Ajax.get(url));
                    return false;
                }
                return true;
            };

            options.success = function (data, textStatus) {
                console.log('   --> Loaded from url: "' + url + '"');
                F.Cache.Ajax.set(url, data, complete);
            };
        }
    });

}(jQuery);