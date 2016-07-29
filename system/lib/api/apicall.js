+function($) {

    FlatOS.Api.Call = function(options, callback) {

        this.options  = $.extend({}, FlatOS.Api.Call.DEFAULTS, options);
        this.callback = callback;

    };

    FlatOS.Api.Call.DEFAULTS = {
        call_async: false,
        api_class: '',
        api_method: '',
        api_arguments: []
    };

    FlatOS.Api.Call.prototype.getClass = function() {
        return this.options.api_class;
    };

    FlatOS.Api.Call.prototype.getMethod = function() {
        return this.options.api_class;
    };

    FlatOS.Api.Call.prototype.getArgs = function() {
        return this.options.args;
    };

    FlatOS.Api.Call.prototype.setMethod = function(api_method) {
        this.options.api_method = api_method;
        return this;
    };

    FlatOS.Api.Call.prototype.setArguments = function(api_arguments) {
        this.options.api_arguments = api_arguments;
        return this;
    };

    FlatOS.Api.Call.prototype.call = function() {
        var api  = this;

        var ajax = new FlatOS.Ajax({
            url: 'system/api/apicall.php',
            type: 'post',
            dataType: 'json',
            cache: false,
            async: this.options.call_async,
            data: { api_class:     this.options.api_class,
                    api_method:    this.options.api_method,
                    api_arguments: this.options.api_arguments },
            success: function(data) {
                if (data.err) {
                    console.error(data.err_msg);
                }
                else {
                    if ($.isFunction(api.callback)) {
                        api.callback(data.res);
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(api);
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });

        ajax.send();
    };

}(jQuery);