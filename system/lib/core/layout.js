+function($) {

    FlatOS.Layout = function(options, callback) {
        this.callback = null;
        this.options  = null;

        if ($.isFunction(options)) {
            this.callback = options;
        } else {
            this.callback = callback || null;
        }

        if (typeof options === 'object') {
            this.options  = options;
        }
        if (typeof options === 'string') {
            this.options  = {
                layout: options
            };
        }

        var that = this;

        if (this.options.layout) {
            var ajax = new FlatOS.Ajax({
                url: 'boot/layouts/' + this.options.layout,
                dataType: 'html',
                async: false,
                cache: true,
                success: function(data) {
                    that.callback(data);
                }
            });

            ajax.send();
        }
    };

    FlatOS.Layout.prototype.getHTML = function(layout) {
        var html = '';

        layout = layout || this.options.layout;

        new FlatOS.Ajax({
            url: 'boot/layouts/' + layout,
            dataType: 'html',
            async: false,
            cache: true,
            success: function(data) {
                html = data;
            }
        }).send();
        
        return html;

    };

}(jQuery);