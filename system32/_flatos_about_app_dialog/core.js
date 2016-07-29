+function ($) {

    FlatOS.System.Application.AboutAppDialog = function(process_name, instance_id) {
        this.process_name = process_name;
        this.instance_id  = instance_id;

        this._a = new FlatOS.Application({
            process_name: this.process_name
        });
        this.app_info = this._a.getInfo();

        this._w = new FlatOS.Window('_flatos_about_app_dialog');
        this._p = new FlatOS.Window(this.process_name, this.instance_id);

        var that = this;

        // Saving old events callbacks
        var Callback     = new FlatOS.Callback();
        var save_onFocus = Callback.get('onFocus', that.process_name+'_'+that.instance_id);

        this._w.instanciate({
            isSystemApp: true,
            taskbar: false,
            resizable: false,
            maximizable: false,
            minimizable: false,
            controls: ['close'],
            callback: function() {
                that._w = new FlatOS.Window('_flatos_about_app_dialog');

                that._p.lock();
                // Unbind callbacks events
                that._p.unbind('focus');

                var instance = that._w.getInstanceID();

                that._w.setTitle('About ' + that.app_info.app_name);

                // Adding new events callbacks
                that._p.on('focus', function() { that._w.focus(); });
                that._w.on('close', function() {
                    // Restore envents callbacks
                    that._p.unbind('focus');
                    $(save_onFocus).each(function() {
                        Callback.add('onFocus', that.process_name+'_'+that.instance_id, this);
                    });

                    // Focus to the parent window
                    setTimeout(function () {
                        that._p.unlock();
                        that._p.focus();
                    }, 500);
                });

                var $_w = that._w.get();

                $_w.find('.about_apps_window_icon').append($('<img src="'+that.app_info.app_icon+'" />'));
                $_w.find('.about_apps_window_desc').text(that.app_info.app_desc);
                $_w.find('.about_apps_window_copy').text(that.app_info.app_copy);
                $_w.find('.button.cancel').click(function() {
                    that._w.close();
                });
            }
        });

    };

}(jQuery);