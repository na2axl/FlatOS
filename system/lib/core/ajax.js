+function($) {

    FlatOS.Ajax = function(options, success, error) {
        if (typeof options === 'object') {
            options.success || (options.success = success || function() {});
            options.error || (options.error = error || function() {});
        }

        this.options = $.extend({}, FlatOS.Ajax.DEFAULTS, options);
        this.result  = null;
    };

    FlatOS.Ajax.DEFAULTS = {
        url: '',
        type: 'post',
        dataType: 'text',
        cache: false,
        async: true,
        data: {},
        beforeSend: function() { },
        complete: function() {},
        success: function(data) { },
        error: function(jqXHR, textStatus, errorThrown) {}
    };

    FlatOS.Ajax.prototype.request = function (options) {
        this.result = $.ajax(options)
    }

    FlatOS.Ajax.prototype.send = function () {
        this.result = $.ajax(this.options);
    };

}(jQuery);