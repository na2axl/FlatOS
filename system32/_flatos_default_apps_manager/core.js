+function ($) {

    FlatOS.System.Application.DefaultAppsManager = function() {
        this._app = new FlatOS.Application({ process_name: '_flatos_default_apps_manager', isSystemApp: true });
    };

    FlatOS.System.Application.DefaultAppsManager.prototype = {
        getAppInfo: function() { },

        launchDefaultApp: function(extension) {
            var process_name = this.getDefaultApp(extension);
            if (process_name === false) {
                // TODO: Create the default app chooser window...
                return;
            }
            _app = new FlatOS.Application(process_name);
            _app.launch();
        },

        getRegExt: function(process_name) {
            var default_apps = this._app.getAppConfig();
            var regext = default_apps.registred_apps[process_name];
            if (typeof regext === 'undefined') {
                return true;
            }
            return regext.split(',');
        },

        getDefaultApp: function(extension) {
            var default_app = this._app.getUserConfig("default_apps")[extension] || this._app.getUserDefaultConfig("default_apps")[extension];
            if (typeof default_app === 'undefined') {
                return false;
            }
            return default_app;
        },

        getRegApps: function(extension) {
            var registred_apps = this._app.getAppConfig("registred_apps");
            var extArray, appArray = new Array();
            for (var app in registred_apps) {
                extArray = registred_apps[app].split(',');
                if (~extArray.indexOf(extension)) {
                    appArray.push(app);
                }
            }
            return appArray;
        },

        openWithDefault: function(filepath) {
            var FS = new FlatOS.System.FS();
            var Callback = new FlatOS.Callback();
            var process_name = this.getDefaultApp(FS.extension(filepath));
            if (process_name === false) {
                return;
            }
            _app = new FlatOS.Application(process_name);
            _app.launch({
                callback: function() {
                    Callback.call('open', process_name, filepath);
                }
            });
        },

        changeDefaultApp: function() { },

        addDefaultApp: function() { },

        removeDefaultApp: function() { }
    };

}(jQuery);