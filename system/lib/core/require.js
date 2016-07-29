+function($) {

    FlatOS.Require = function(options) {
        this.options = $.extend({}, FlatOS.Require.DEFAULTS, options);

        var that = this;

        if (typeof this.options.path === 'object') {
            $(this.options.path).each(function() {
                that._call(this);
            });
        } else {
            this._call(this.options.path);
        }
    };

    FlatOS.Require.DEFAULTS = {
        path: null,
        callback: null,
        context: 'head',
        load: 'uri',
        type: 'js',
        className: ''
    };

    FlatOS.Require.prototype._call = function(path) {
        var that = this;

        var ajax = new FlatOS.Ajax({
            url: path,
            dataType: "text",
            cache: true,
            async: false,
            success: function(script) {
                if (that.options.type === 'js') {
                    var $script = $('<script></script>').addClass(that.options.className).attr({type: 'text/javascript'});
                    if (that.options.load === 'uri') {
                        $script.attr('src', path);
                    }
                    else {
                        $script.text(script);
                    }
                    $script.appendTo(that.options.context);
                }
                if (that.options.type === 'css') {
                    var $style;
                    if (that.options.load === 'uri') {
                        $style = $('<link></link>').addClass(that.options.className).attr({rel: 'stylesheet', type: 'text/css'});
                        $style.attr('href', path);
                    }
                    else {
                        $style = $('<style></style>').addClass(that.options.className).attr({type: 'text/css'});
                        $style.text(script);
                    }
                    $style.appendTo(that.options.context);
                }
                if ($.isFunction(that.options.callback)) {
                    that.options.callback(script);
                }
            },
            error: function() {
                console.warn('  --> Cannot load "'+path+'"');
            }
        });

        ajax.send();
    };

}(jQuery);