// Create a namespace
F.Application = {}
// ------------------

F.Application.launch = function (options) {
    var defaults = {
        isSystemApp: false,
        process_name: '',
        taskbar: true,
        callback: null,
        controls: ['min', 'max', 'close'],
        resizable: true,
        draggable: true,
        minimizable: true,
        maximizable: true,
        async: true
    };

    var param = $.extend({}, defaults, options);

    var FS = new FlatOS.System.FS();

    var $app_config = $(FS.read(F.Application.getPath(param.process_name, param.isSystemApp) + '/app.xml'));

    var app_name = $app_config.find('attribute[name=app_name]').attr('value'),
        process_name = $app_config.find('attribute[name=process_id]').attr('value'),
        window_h = $app_config.find('attribute[name=height]').attr('value'),
        window_w = $app_config.find('attribute[name=width]').attr('value'),
        multi_instance = $app_config.find('attribute[name=multi_instance]').attr('value'),
        controls  = ($app_config.find('attribute[name=window_controls]').length > 0) ? $app_config.find('attribute[name=window_controls]').attr('value').split(',') : param.controls,
        taskbar   = ($app_config.find('attribute[name=taskbar_icon]').length > 0) ? !!(parseInt($app_config.find('attribute[name=taskbar_icon]').attr('value'))) : param.taskbar,
        resizable = ($app_config.find('attribute[name=resizable]').length > 0) ? !!(parseInt($app_config.find('attribute[name=resizable]').attr('value'))) : param.resizable,
        draggable = ($app_config.find('attribute[name=draggable]').length > 0) ? !!(parseInt($app_config.find('attribute[name=draggable]').attr('value'))) : param.draggable,
        minimizable = ($app_config.find('attribute[name=minimizable]').length > 0) ? !!(parseInt($app_config.find('attribute[name=minimizable]').attr('value'))) : param.minimizable,
        maximizable = ($app_config.find('attribute[name=maximizable]').length > 0) ? !!(parseInt($app_config.find('attribute[name=maximizable]').attr('value'))) : param.maximizable;

    var includes = {
        js: [],
        css: []
    };

    $app_config.find('includes').children('file').each(function() {
        includes.js.push($('<script></script>').attr({type: 'text/javascript', src: ($(this).attr('path')).replace(RegExp("{app_uri}", "g"),  'apps/' + process_name)}));
    });

    includes.js.push($('<script></script>').attr({type: 'text/javascript', src: F.Application.getURI(param.process_name, param.isSystemApp) + '/app.js'}));

    includes.css.push($('<link></link>').attr({rel: 'stylesheet', href: F.Application.getURI(param.process_name, param.isSystemApp) + '/app.css'}));

    var $menu = F.Window.Menu.get(process_name, param.isSystemApp);

    F.Window.open({
        'app_name': app_name,
        'process_name': process_name,
        'window_w': window_w,
        'window_h': window_h,
        'multi_instance': multi_instance,
        'includes': includes,
        'menu': $menu,
        'isSystemApp': param.isSystemApp,
        'taskbar': taskbar,
        'callback': param.callback,
        'controls': controls,
        'resizable': resizable,
        'draggable': draggable,
        'minimizable': minimizable,
        'maximizable': maximizable
    });

};

F.Application.createUserConfig = function (process_name, isSystemApp, user) {
    var User = new FlatOS.System.User(user);
    var FS = new FlatOS.System.FS();

    var userpath = User.getTruePath('~/.apps');

    FS.mkfile(userpath+'/'+process_name+'/app.json', true);

    var appconfig = FS.read(F.Application.getPath(process_name, isSystemApp) + '/user.json');

    FS.write(userpath+'/'+process_name+'/app.json', appconfig);
};

F.Application.getUserConfig = function (process_name, isSystemApp, user, config_name) {
    var app_config_file = {};
    var FS = new FlatOS.System.FS();
    var User = new FlatOS.System.User(user);

    if (!FS.exists(User.getTruePath('~/.apps/'+process_name+'/app.json'))) {
        F.Application.createUserConfig(process_name, isSystemApp, user);
        return F.Application.getUserConfig(process_name, isSystemApp, user, config_name);
    }
    else {
        app_config_file = $.parseJSON(FS.read(User.getTruePath('~/.apps/'+process_name+'/app.json')));
        if (typeof config_name === 'undefined') {
            return app_config_file;
        }
        else {
            if (app_config_file[config_name] === undefined) {
                return null;
            }
            else {
                return app_config_file[config_name];
            }
        }
    }
};

F.Application.setUserConfig = function(process_name, isSystemApp, user, config) {
    var FS = new FlatOS.System.FS();
    var User = new FlatOS.System.User(user);

    if (!FS.exists(User.getTruePath('~/.apps/'+process_name+'/app.json'))) {
        F.Application.createUserConfig(process_name, isSystemApp, user);
        return F.Application.setUserConfig(process_name, isSystemApp, user, config);
    }
    else {
        if (typeof config === 'object') {
            config = JSON.stringify(config);
        }

        return FS.write(User.getTruePath('~/.apps/'+process_name+'/app.json'), config);
    }
};

F.Application.getUserDefaultConfig = function (process_name, isSystemApp, config_name) {
    var app_config_file = {};
    var FS = new FlatOS.System.FS();

    app_config_file = $.parseJSON(FS.read(F.Application.getPath(process_name, isSystemApp)+'/user.json'));

    if (typeof config_name === 'undefined') {
        return app_config_file;
    }
    else {
        if (app_config_file[config_name] === undefined) {
            return null;
        }
        else {
            return app_config_file[config_name];
        }
    }
};

F.Application.getAppConfig = function (process_name, isSystemApp, config_name) {
    var app_config_file = {};
    var FS = new FlatOS.System.FS();

    app_config_file = $.parseJSON(FS.read(F.Application.getPath(process_name, isSystemApp)+'/app.json'));

    if (typeof config_name === 'undefined') {
        return app_config_file;
    }
    else {
        if (app_config_file[config_name] === undefined) {
            return null;
        }
        else {
            return app_config_file[config_name];
        }
    }
};

F.Application.setAppConfig = function(process_name, isSystemApp, config) {
    var FS = new FlatOS.System.FS();
    var User = new FlatOS.System.User();

    if (typeof config === 'object') {
        config = JSON.stringify(config);
    }

    return FS.write(F.Application.getPath(process_name, isSystemApp)+'/app.json', config);
};


F.Application.getPath = function(process_name, isSystemApp) {
    return '/' + F.Application.getURI(process_name, isSystemApp);
};

F.Application.getURI = function(process_name, isSystemApp) {
    if (isSystemApp) {
        return 'system32/' + process_name;
    }
    else {
        return 'apps/' + process_name;
    }
};

F.Application.getInfo = function(process_name, isSystemApp, info_name) {
    var info,
        url = F.Application.getPath(process_name, isSystemApp);

    var FS = new FlatOS.System.FS();

    var config = FS.read(url + '/app.xml');
    var $app_config = $(config);

    if (typeof info_name === "undefined") {
        info = {
            'app_name': $app_config.find('attribute[name="app_name"]').attr('value'),
            'app_desc': $app_config.find('attribute[name="app_desc"]').attr('value'),
            'app_auth': $app_config.find('attribute[name="app_auth"]').attr('value'),
            'app_copy': $app_config.find('attribute[name="app_copy"]').attr('value'),
            'process_id': $app_config.find('attribute[name="process_id"]').attr('value'),
            'multi_instance': $app_config.find('attribute[name="multi_instance"]').attr('value'),
            'app_icon': $app_config.find('attribute[name="app_icon"]').attr('value') && ($app_config.find('attribute[name="app_icon"]').attr('value')).replace(RegExp("{app_uri}", "g"),  'apps/' + $app_config.find('attribute[name="process_id"]').attr('value'))
        };
    }
    else {
        if (info_name === "xml") {
            info = config;
        }
        else {
            info = $app_config.find('attribute[name="'+info_name+'"]').attr('value');
        }
    }

    return info;
};

F.Application.guessAppType = function(process_name) {
    var FS = new FlatOS.System.FS();

    if (FS.exists('/apps/'+process_name)) {
        return false;
    }
    if (FS.exists('/system32/'+process_name)) {
        return true;
    }
};

F.Application.registerCommand = function(process_name, command, callback) {
    new FlatOS.Callback().add(command, process_name, callback);
};

F.Application.setContextMenuAction = function(process_name, command, callback) {
    new FlatOS.Callback().addContextualMenuAction(process_name, command, callback);
};