+function ($) {

    FlatOS.System.Application.ConfirmDialog = function (options, callback) {

        var defaults = {
            parent_pid: null,
            parent_iid: null,
            title: null,
            content: '',
            ok: 'OK',
            cancel: 'Cancel'
        };

        this.options  = $.extend( {}, defaults, options );

        this.callback = callback;

        this._p = new FlatOS.Window(this.options.parent_pid, this.options.parent_iid);
        this._w = new FlatOS.Window('_flatos_confirm_dialog');

        var that = this;

        // Saving old events callbacks
        var Callback     = new FlatOS.Callback();
        var save_onFocus = Callback.get('onFocus', that.options.parent_pid+'_'+that.options.parent_iid);

        this._w.instanciate({
            isSystemApp: true,
            taskbar: false,
            resizable: false,
            maximizable: false,
            minimizable: false,
            controls: ['close'],
            callback: function() {
                that._w = new FlatOS.Window('_flatos_confirm_dialog');

                that._p.lock();
                // Unbind callbacks events
                that._p.unbind('focus');

                var $_w  = that._w.get(),
                    isOK = false;

                // Adding new events callbacks
                that._w.overwrite('close', function() { that._w.close(); });
                that._p.on('focus', function() { that._w.focus(); });
                that._p.on('close', function() { that._w.close(); });
                that._w.on('close', function() {
                    // Restore envents callbacks
                    that._p.unbind('focus');
                    $(save_onFocus).each(function() {
                        Callback.add('onFocus', that.options.parent_pid+'_'+that.options.parent_iid, this);
                    });

                    // Focus to the parent window
                    setTimeout(function () {
                        that._p.unlock();
                        that._p.focus();
                    }, 500);
                });

                that.options.title && that._w.setTitle(that.options.title);

                $_w.find('div.confirm_window_message').html(that.options.content);
                $_w.find('div.button.ok').text(that.options.ok).click(function() {
                    isOK = true;
                    that._w.close();
                    if ($.isFunction(that.callback)) {
                        that.callback(isOK);
                    }
                });
                $_w.find('div.button.cancel').text(that.options.cancel).click(function() {
                    that._w.close();
                    if ($.isFunction(that.callback)) {
                        that.callback(isOK);
                    }
                });
            }
        });

    };

}(jQuery);