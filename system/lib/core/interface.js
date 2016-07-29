+function ($) {

    FlatOS.Interface = function () {
        // @ignore
    };

    FlatOS.Interface.prototype.boot = function() {
        var that    = this;
        var Require = new FlatOS.Require();
        var FS      = new FlatOS.System.FS();
        var UI      = FS.readDir("system/ui/flatos/interface", true, {'file_type': 'js', 'path_type' : FS.FILESYSTEM_PATH});

        for (var js in UI) {
            new FlatOS.Require({
                path: UI[js].toString(),
                className: 'user-js'
            })
        }

        new FlatOS.Layout('boot-loader.html', function(html) {
            that.set("#desktop-wrapper", html);
        });

        $([
            'boot/lib/ui.js',
            'boot/lib/application.js',
            'boot/lib/taskbar.js',
            'system/lib/core/icon.js',
            'system/lib/core/user.js',
            'boot/lib/window.js',
            'system/lib/core/userconfig.js',
            'system/lib/core/shortcut.js',
            'system/lib/core/events.js',
            'system/lib/core/keyboard.js',
            'system/lib/core/mouse.js',
            'system/lib/core/application.js',
            'system/lib/core/window.js',
            'system/lib/core/desktop.js',
            'system/lib/core/taskbar.js',
            'system/lib/core/startscreen.js'
        ]).each(function () {
            var that = this.toString();
            new FlatOS.Require({
                path: that,
                className: 'core-js'
            });
        });

        var FS = new FlatOS.System.FS();
        var system_apps = FS.readDir('/system32');

        for (var system_app in system_apps) {
            Require._call('system32/'+system_app+'/core.js');
        }

        new FlatOS.System.Events().triggerStartingEvents();

//         $(document.body)
//             .attr('unselectable','on')
//             .css({
//                 '-moz-user-select':'-moz-none',
//                 '-moz-user-select':'none',
//                 '-o-user-select':'none',
//                 '-khtml-user-select':'none',
//                 '-webkit-user-select':'none',
//                 '-ms-user-select':'none',
//                 'user-select':'none'
//             }).bind('selectstart', function(){ return false; });

        setTimeout(function() {
            $('#boot-loader').fadeOut(500, function() { $(this).remove(); });
        }, 1000);
    };

    FlatOS.Interface.prototype.authenticate = function() {
        var User      = new FlatOS.System.User();
        var that      = this;
        new FlatOS.Layout('connect-user.html', function(html) {
            var $html = $(html);
            var users  = User.userList();
            var $ul    = $('<ul class="flatos-connect-user-list grid"></ul>');
            var passwd = {};

            for (var user in users) {
                var config = new FlatOS.System.UserConfig(user).getConfig('account');
                passwd[user] = config.acc_password;
            }

            var authenticate = function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                var username = $('.flatos-connect-user-id-input').val();
                var password = $('.flatos-connect-user-password-input').val();
                $('.flatos-connect-user-authenticate').val('Connecting...');

                if (password === passwd[username]) {
                    var config = new FlatOS.System.UserConfig(username).getConfig('ui');
                    User.set_session_value('interface', config.interface);
                    User.set_session_value('icons', config.icons);
                    User.set_session_value('username', username);
                    that.desktop(function() {
                        $("#flatos-connect-user-chooser,#flatos-connect-user-connecter,.flatos-connect-user-bg").remove();
                        $("#desktop").show();
                    });
                } else {
                    new FlatOS.Notification("The password isn't correct");
                    $('.flatos-connect-user-authenticate').val('Connect');
                }
            };

            for (var user in users) {
                new FlatOS.Layout('user-item.html', function(item) {
                    var $item  = $(item);
                    var config = new FlatOS.System.UserConfig(user).getConfig('account');
                    var avatar = User.getTruePath(config.acc_picture, user);

                    $item.find('.flatos-connect-user-display-name').text(config.acc_display_name);
                    $item.find('.flatos-connect-user-id').text(user);
                    $item.find('.flatos-connect-user-avatar').attr({src: avatar});
                    $item.on('click.flatos.connect.chooseUser', function() {
                        $('.flatos-connect-user-avatar.flatos-connect-choosen-user').attr({src: $(this).find('.flatos-connect-user-avatar').attr('src')});
                        $('.flatos-connect-user-id-input').val($(this).find('.flatos-connect-user-id').text());
                        $('.flatos-connect-user-password-input').val('').focus();
                        $('.flatos-connect-user-display-name.flatos-connect-choosen-user').text($(this).find('.flatos-connect-user-display-name').text());
                        $('#flatos-connect-user-chooser').animate({left: '-100%'}, 500);
                        $('.flatos-connect-user-choose').on('click.flatos.connect.backToChooseUser', function() {
                            $('#flatos-connect-user-chooser').animate({left: 0}, 500);
                        });
                        if (config.acc_password === '') {
                            $('.flatos-connect-user-password-input').hide();
                            authenticate();
                        }
                    });
                    $ul.append($item);
                });
            }

            $html.find('.flatos-connect-user-authenticate').on('click.flatos.connect.authenticate', authenticate);

            $html.find('.flatos-connect-user-form').on('submit.flatos.connect.authenticate', authenticate);

            $html.find('.flatos-connect-user-list-wrapper').append($ul);

            that.set("#desktop-wrapper", $html, true);
        });
    };

    FlatOS.Interface.prototype.desktop = function(callback, timeOut) {
        $(document.body).addClass('non-responsive');
        var that = this;
        this.reload(function () {
            new FlatOS.UI.Desktop().load(function () {
                new FlatOS.Layout('startscreen.html', function (html) {
                    var $startscreen = $(html);
                    $startscreen.hide().appendTo('#base-desktop');

                    var StartScreen = new FlatOS.UI.StartScreen();
                    new FlatOS.Input.Mouse().leftClick('startscreen.open', '#startmenu', function() {
                        StartScreen.toggle();
                    });

                    var TaskBar = new FlatOS.UI.TaskBar();
                    TaskBar.load();

                    callback();
                })
            }, timeOut);
        });
    };

    FlatOS.Interface.prototype.set = function(el, html, append) {
        append = append || false;

        append ? $(el).append($(html)) : $(el).empty().append($(html));
    };

    FlatOS.Interface.prototype.reload = function(ui, callback) {
        var config = new FlatOS.System.UserConfig().getConfig('ui');

        if ($.isFunction(ui)) {
            callback = ui;
            ui = config.interface;
        } else {
            ui = ui || config.interface;
        }

        $('#interface-loader-wrapper').removeClass('zoomOut').addClass('fadeIn').show();
        setTimeout(function () {
            $('head').find('.user-css').remove();
            $('head').find('.user-js').remove();
            var FS    = new FlatOS.System.FS();
            var UICSS = FS.readDir("system/ui/"+ui+"/interface", true, {'file_type': 'css', 'path_type' : FS.FILESYSTEM_PATH});
            var UIJS  = FS.readDir("system/ui/"+ui+"/interface", true, {'file_type': 'js', 'path_type' : FS.FILESYSTEM_PATH});

            for (var js in UIJS) {
                new FlatOS.Require({
                    path: UIJS[js].toString(),
                    className: 'user-js'
                });
            }
            for (var css in UICSS) {
                $('<link></link>').addClass('user-css').attr({rel: 'stylesheet', type: 'text/css', href: UICSS[css]}).appendTo('head');
            }

            F.UI.interface = ui;
            F.UI.icons = config.icons;

            if ($.isFunction(callback)) {
                callback();
            }

            setTimeout(function() {
                $('#interface-loader-wrapper').removeClass('fadeIn').addClass('zoomOut');
                setTimeout(function() {
                    $('#interface-loader-wrapper').css('display', 'none');
                }, 500);
            }, 1000);
        }, 500);
    };

}(jQuery);