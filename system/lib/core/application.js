+function ($) {

    FlatOS.Application = function (options) {
        if (typeof options === 'string') {
            options = {
                process_name: options
            };
        }

        options = options || {};

        var defaults = {
            process_name: '',
            isSystemApp: undefined
        };

        this.options = $.extend({}, defaults, options);

        if (typeof this.options.isSystemApp === 'undefined') {
            this._guessAppType();
        }
    };

    FlatOS.Application.prototype.launch = function (options) {
        F.Application.launch($.extend({}, options, this.options));
    };

    FlatOS.Application.prototype.getUserConfig = function (config_name, user) {
        return F.Application.getUserConfig(this.options.process_name, this.options.isSystemApp, user, config_name);
    };

    FlatOS.Application.prototype.setUserConfig = function(config, user) {
        return F.Application.setUserConfig(this.options.process_name, this.options.isSystemApp, user, config);
    };

    FlatOS.Application.prototype.getUserDefaultConfig = function (config_name) {
        return F.Application.getUserDefaultConfig(this.options.process_name, this.options.isSystemApp, config_name);
    };

    FlatOS.Application.prototype.getAppConfig = function (config_name) {
        return F.Application.getAppConfig(this.options.process_name, this.options.isSystemApp, config_name);
    };

    FlatOS.Application.prototype.setAppConfig = function(config) {
        return F.Application.setAppConfig(this.options.process_name, this.options.isSystemApp, config);
    };

    FlatOS.Application.prototype.getPath = function() {
        return F.Application.getPath(this.options.process_name, this.options.isSystemApp)
    };

    FlatOS.Application.prototype.getURI = function() {
        return F.Application.getURI(this.options.process_name, this.options.isSystemApp);
    };

    FlatOS.Application.prototype.getInfo = function(info_name) {
        return F.Application.getInfo(this.options.process_name, this.options.isSystemApp, info_name);
    };

    FlatOS.Application.prototype.registerCommand = function(command, callback) {
        F.Application.registerCommand(this.options.process_name, command, callback);
    };

    FlatOS.Application.prototype._guessAppType = function() {
        this.options.isSystemApp = F.Application.guessAppType(this.options.process_name);
    };

    FlatOS.Application.prototype.setContextMenuAction = function(command, callback) {
        F.Application.setContextMenuAction(this.options.process_name, command, callback);
    };

    FlatOS.Application.prototype.restart = function(instance, options) {
        var that = this
            , _w = new FlatOS.Window(this.options.process_name, instance);
        _w.close();
        setTimeout(function() {
            that.launch(options);
        }, 500);
    };

}(jQuery);