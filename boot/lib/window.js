// Create a namespace
F.Window = {};
// ------------------

F.Window.get = function(process_name, instance_id) {
    if (typeof instance_id !== 'undefined') {
        return $('.window[data-process-id='+process_name+'][data-instance-id='+instance_id+']');
    }
    else {
        return $('.window[data-process-id='+process_name+']');
    }
};

F.Window.getInstanceID = function(process_name) {

    var current_window = '.window[data-process-id='+process_name+']';

    var $windows = $(current_window),
        instance = 1;

    $windows.each(function() {
        var instance_id = $(this).attr('data-instance-id');
        if ((typeof instance_id !== 'undefined') && (parseInt(instance_id) > instance)) {
            instance = parseInt(instance_id);
        }
    });

    return instance;

};

F.Window.setInstanceID = function(process_name) {

    var current_window = '.window[data-process-id='+process_name+']';

    var $windows = $(current_window),
        instance = 1;

    if ($windows.is('.window[data-instance-id]')) {
        $windows.each(function() {
            var instance_id = $(this).attr('data-instance-id');
            if ((typeof instance_id !== 'undefined') && (parseInt(instance_id) > instance)) {
                instance = parseInt(instance_id);
            }
            if (typeof instance_id === 'undefined') {
                $(this).attr('data-instance-id', instance+1);
            }
        });
    }
    else {
        $windows.each(function(eq) {
            $(this).attr('data-instance-id', eq+1);
        });
    }

};

F.Window.setProcessID = function(current_window) {

    var $windows = $('.window'),
        index    = 1050;

    $windows.each(function() {
        var z_index = $(this).css('z-index');
        if ((typeof z_index !== 'undefined') && (parseInt(z_index) > index)) {
            index = parseInt(z_index);
        }
    });

    $(current_window).attr('data-process-nb', $windows.length).css('z-index', index+2);

};

F.Window.setTitle = function(process_name, instance_id, title) {

    var $window = F.Window.get(process_name, instance_id);

    $window.children('.titlebar').children('.title').html('<span>'+title+'</span>');

};

F.Window.getTitle = function(process_name, instance_id) {

    var $window = F.Window.get(process_name, instance_id);

    return $window.children('.titlebar').children('.title').children('span').text();

};

F.Window.open = function (options) {

    var defaults = {
        'app_name': null,
        'process_name': null,
        'window_w': null,
        'window_h': null,
        'multi_instance': 0,
        'includes': [],
        'menu': null,
        'taskbar': true,
        'callback': null,
        'controls': ['min', 'max', 'close'],
        'resizable': true,
        'draggable': true,
        'minimizable': true,
        'maximizable': true,
        'isSystemApp': false,
        'class_name': ''
    };

    var param = $.extend({}, defaults, options);

    var current_window = '.window[data-process-id='+param.process_name+']';

    var isAlreadyOpened = $('.window').is(current_window);

    var app_uri  = F.Application.getURI(param.process_name, param.isSystemApp);

    if (!isAlreadyOpened || (isAlreadyOpened && param.multi_instance == 1)) {

        F.Window.setInstanceID(param.process_name);

        var $app_window  = $('<div></div>'),
            $window_bar  = $('<div></div>'),
            $window_main = $('<div></div>'),
            $window_opts = $('<div></div>'),
            $window_cont = $('<div></div>');

        if (typeof param.window_w !== 'undefined') {
            if ($("#windows").outerWidth() >= param.window_w) {
                $app_window.css({width: param.window_w});
            }
            else {
                $app_window.css({width: $("#windows").width()});
            }
        }
        if (typeof param.window_h !== 'undefined') {
            if ($("#windows").outerHeight() >= param.window_h) {
                $app_window.css({height: param.window_h});
            }
            else {
                $app_window.css({height: $("#windows").height()});
            }
        }

        $(param.includes.css).each(function(eq) {
            $(this).appendTo($app_window);
        });

        $app_window.attr({
            'class': "window " + param.process_name + ' ' + param.class_name,
            'data-current-window': 1,
            'data-process-id': param.process_name,
            'data-active-window': 1,
            'data-window-size': 0
        });

        $window_bar
            .addClass('titlebar')
            .append('<div class="title"><span>'+param.app_name+'</span></div>')
            .append('<div class="controls"><ul></ul></div>');

        $(param.controls).each(function() {
            if (this == 'min') {
                $window_bar.children('.controls').children('ul')
                    .append('<li class="hide"></li>');
            }
            if (this == 'max') {
                $window_bar.children('.controls').children('ul')
                    .append('<li class="full"></li>');
            }
            if (this == 'close') {
                $window_bar.children('.controls').children('ul')
                    .append('<li class="close"></li>');
            }
        });

        $window_opts
            .addClass('window-options')
            .append(param.menu);

        $window_cont
            .addClass('main-content');

        $window_main
            .addClass('content')
            .append($window_opts)

        var html = new FlatOS.System.FS().read(app_uri + '/app.html');

        $window_cont
            .html(html)
            .appendTo($window_main);

        $app_window
            .append($window_bar)
            .append($window_main);

        $app_window
            .css({
                opacity: 0,
                top: ( parseInt($('#windows').outerHeight()) / 2 ) - ( parseInt($app_window.outerHeight()) / 2 ),
                left: ( parseInt($('#windows').outerWidth()) / 2 ) - ( parseInt($app_window.outerWidth()) / 2 )
            })
            .appendTo('#windows');

        F.Window.setInstanceID(param.process_name);

        F.Window.setProcessID($app_window);

        F.Window.resize_main_content($app_window);

        $(param.includes.js).each(function(eq) {
            $(this).appendTo($app_window);
        });

        F.Window.init(param.process_name, {
            multi_instance: param.multi_instance,
            instance_id: $app_window.attr('data-instance-id'),
            resizable: param.resizable,
            draggable: param.draggable,
            minimizable: param.minimizable,
            maximizable: param.maximizable
        });

        if (param.taskbar === true) {
            F.Taskbar.add(param.process_name, $app_window.attr('data-instance-id'));
        }

        F.Window.switch_to($app_window);

        if ($.isFunction(param.callback)) {
            if (param.multi_instance == 1) {
                param.callback($app_window.attr('data-instance-id'));
            }
            else {
                param.callback(1);
            }
        }
    }
    else {
        F.Window.switch_to(current_window);

        if ($.isFunction(param.callback)) {
            if (param.multi_instance == 1) {
                param.callback($app_window.attr('data-instance-id'));
            }
            else {
                param.callback(1);
            }
        }
    }
};

F.Window.init = function (process_name, options) {
    var defaults = {
        multi_instance: 0,
        instance_id: 0,
        resizable: true,
        draggable: true,
        minimizable: true,
        maximizable: true
    };

    var param = $.extend(defaults, options);

    param.minWidth  = F.Application.getInfo(process_name, param.isSystemApp, 'min_width');
    param.minHeight = F.Application.getInfo(process_name, param.isSystemApp, 'min_height');

    var element = '.window[data-process-id='+process_name+']';

    if (param.multi_instance == 1) {
        element = element + '[data-instance-id='+param.instance_id+']';
    }

    var index = process_name+'_'+param.instance_id;

    var Mouse = new FlatOS.Input.Mouse();
    var Callback = new FlatOS.Callback();

    $(element)
        .css('opacity', 1)
        .attr({
            'id': 'flatos_app_'+process_name+'_'+param.instance_id
        })
        .each(function() {
            F.Window.resize_main_content(this);
        });

    Mouse.leftClick('window.switch_to_this', element, function() {
        if (parseInt($(element).attr('data-current-window')) === 0) {
            F.Window.switch_to(this);
        }
    });

    if (param.resizable) {
        $(element)
            .resizable({
                cancel: ".content",
                containment: "#windows",
                handles: "n,e,s,w,se,sw,ne,nw",
                minWidth: parseInt(param.minWidth) > 0 ? parseInt(param.minWidth) : 300,
                minHeight: parseInt(param.minHeight) > 0 ? parseInt(param.minHeight) : 300,
                start: function( event, ui ) {
                    F.Window.switch_to(this);
                    Callback.call('onResizeBegin', 'ui_'+F.UI.interface+'_window', element);
                    Callback.call('onResizeBegin', index);
                },
                resize: function( event, ui ) {
                    F.Window.resize_main_content(this);
                    Callback.call('onResizing', 'ui_'+F.UI.interface+'_window', element);
                    Callback.call('onResizing', index);
                },
                stop: function( event, ui ) {
                    F.Window.resize_main_content(this);
                    Callback.call('onResizeEnd', 'ui_'+F.UI.interface+'_window', element);
                    Callback.call('onResizeEnd', index);
                }
            });
        }
    if (param.draggable) {
        $(element)
            .draggable({
                cancel: ".content, .controls",
                start: function( event, ui ) {
                    if ($(element).attr('data-window-size') == 1) {
                        F.Window.maximize(element, Callback.get('onMaximize', index), Callback.get('onRestore', index));
                    }
                    F.Window.switch_to(this);
                    Callback.call('onDragBegin', 'ui_'+F.UI.interface+'_window', element);
                    Callback.call('onDragBegin', index);
                },
                drag: function( event, ui ) {
                    Callback.call('onDragging', 'ui_'+F.UI.interface+'_window', element);
                    Callback.call('onDragging', index);
                },
                stop: function (event, ui) {
                    if ($(element).offset().top < 0) {
                        $(element).css('top', 0);
                    }
                    Callback.call('onDragEnd', 'ui_'+F.UI.interface+'_window', element);
                    Callback.call('onDragEnd', index);
                },
                handle: ".titlebar"
            });
    }

    Mouse.leftClick('window.close_this', $(element).children('.titlebar').children('.controls').find('.close'), function() {
        F.Window.close(element, Callback.get('onClose', index));
    });

    if (param.maximizable) {
        Mouse.leftClick('window.maximize_this', $(element).children('.titlebar').children('.controls').find('.full'), function() {
            F.Window.maximize(element, Callback.get('onMaximize', index), Callback.get('onRestore', index));
        });

        Mouse.doubleClick('window.maximize_this', $(element).children('.titlebar'), function() {
            F.Window.maximize(element, Callback.get('onMaximize', index), Callback.get('onRestore', index));
        });

        FlatOS.Shortcut.add('Ctrl+Alt+M', function() {
            F.Window.maximize(element, Callback.get('onMaximize', index), Callback.get('onRestore', index));
        }, {
            target: 'flatos_app_'+index
        });
    }

    if (param.minimizable) {
        Mouse.leftClick('window.minimize_this', $(element).find('.controls').find('.hide'), function() {
            F.Window.hide(element, Callback.get('onHide', index));
        });

        FlatOS.Shortcut.add('Ctrl+Alt+Shift+M', function() {
            F.Window.hide(element, Callback.get('onHide', index));
        }, {
            target: 'flatos_app_'+index
        });
    }

    $(element + ' .window-options')
        .children('ul')
        .children('li')
        .each(function() {
            var $li = $(this);
            if ($li.children('ul').length > 0) {
                $li.hover(
                    function() {
                        $li.click(function() {
                            $(element + ' .window-options').children('ul').find('ul').hide();
                            $li.children('ul').show().mouseleave(function() {
                                $li.find('ul').hide();
                            }).click(function(){
                                $li.unbind('click').find('ul').hide();
                            });
                        });
                    },
                    function() {
                        $li.find('ul').hide();
                    });
            }
        });

    $(element + ' .window-options')
        .children('ul')
        .children('li')
        .find('li')
        .each(function() {
            var $li = $(this);
            if ($li.children('ul').length > 0) {
                $li.hover(
                    function() {
                        $li.children('ul').css({'left': $li.outerWidth(true), 'top': parseInt($li.css('top'))-parseInt($li.css('padding-top'))}).show().mouseleave(function() {
                            $(this).hide();
                        });
                    },
                    function() {
                        $li.children('ul').hide();
                    }).click(function(){
                        $(element + ' .window-options')
                            .children('ul')
                            .find('ul')
                            .hide();
                    });
            }
        });

    FlatOS.Shortcut.add('Ctrl+Alt+F4', function() {
        F.Window.close(element, Callback.get('onClose', index));
    }, {
        target: 'flatos_app_'+index
    });

    FlatOS.Shortcut.add('F1', function() {
        new FlatOS.System.Application.AboutAppDialog(process_name, param.instance_id);
    }, {
        target: 'flatos_app_'+index
    });

    var frameUpdateInterval = setInterval(function () {
        Callback.call('onFrameUpdate', 'ui_' + F.UI.interface + '_window', element);
        Callback.call('onFrameUpdate', index);
        F.Window.resize_main_content(element);
    }, 100);

    F.Window.on('close', process_name, function () { clearInterval(frameUpdateInterval) }, param.instance_id);

    Callback.call('onInit', 'ui_'+F.UI.interface+'_window', element);
    Callback.call('onInit', index);

};

F.Window.on = function (action, process_name, callback, instance_id) {
    var index = process_name+'_'+instance_id;
    var _callback = new FlatOS.Callback();

    if ($.isFunction(callback)) {
        switch (action) {
            case 'init':
                _callback.add('onInit', index, callback);
            break;

            case 'close':
                _callback.add('onClose', index, callback);
            break;

            case 'resizeBegin':
                _callback.add('onResizeBegin', index, callback);
            break;

            case 'resizing':
                _callback.add('onResizing', index, callback);
            break;

            case 'resizeEnd':
                _callback.add('onResizeEnd', index, callback);
            break;

            case 'maximize':
                _callback.add('onMaximize', index, callback);
            break;

            case 'minimize':
                _callback.add('onHide', index, callback);
            break;

            case 'dragBegin':
                _callback.add('onDragBegin', index, callback);
            break;

            case 'dragging':
                _callback.add('onDragging', index, callback);
            break;

            case 'dragEnd':
                _callback.add('onDragEnd', index, callback);
            break;

            case 'focus':
                _callback.add('onFocus', index, callback);
            break;

            case 'update':
                _callback.add('onFrameUpdate', index, callback);
            break;
        }
    }
};

F.Window.overwrite = function (action, process_name, callback, instance_id) {
    element = '.window[data-process-id='+process_name+']';

    if (typeof instance_id !== 'undefined') {
        element = element + '[data-instance-id='+instance_id+']';
    }

    if ($.isFunction(callback)) {
        var Mouse = new FlatOS.Input.Mouse();
        switch (action) {
            case 'close':
                var close = $(element).children('.titlebar').children('.controls').find('.close');
                Mouse.unbindLeftClick('window.close_this', close);
                Mouse.leftClick('window.close_this', close, callback);
                FlatOS.Shortcut.remove('Ctrl+Alt+F4', 'flatos_app_'+process_name+'_'+instance_id);
                FlatOS.Shortcut.add('Ctrl+Alt+F4', callback, { target: 'flatos_app_'+process_name+'_'+instance_id });
            break;

            case 'maximize':
                var full = $(element).children('.titlebar').children('.controls').find('.full');
                Mouse.unbindLeftClick('window.maximize_this', full);
                Mouse.leftClick('window.maximize_this', full, callback);
                Mouse.unbindDoubleClick('window.maximize_this', $(element).children('.titlebar'));
                Mouse.doubleClick('window.maximize_this', $(element).children('.titlebar'), callback);
            break;

            case 'minimize':
                var hide = $(element).children('.titlebar').children('.controls').find('.hide');
                Mouse.unbindLeftClick('window.minimize_this', hide);
                Mouse.leftClick('window.minimize_this', hide, callback);
            break;
        }
    }

};

F.Window.resize_main_content = function(current_window) {
    var h = parseInt($(current_window).find('.content').css('height')) - parseInt($(current_window).find('.window-options').css('height'));
    $(current_window).find('.main-content').css({height: h});
};

F.Window.switch_to = function(new_window) {
    var process_name = $(new_window).attr('data-process-id');
    var instance_id  = $(new_window).attr('data-instance-id');
    var Callback = new FlatOS.Callback();
    $('.window').attr('data-current-window', 0);
    $(new_window).attr('data-current-window', 1);
    F.Window.refresh_z_index();
    F.Taskbar.refresh();
    Callback.call('onFocus', process_name+'_'+instance_id);
};

F.Window.refresh_z_index = function() {
    var $windows = $('.window'),
        index    = 1050;

    $windows.each(function() {
        if ((typeof $(this).css('z-index') !== 'undefined') && (parseInt($(this).css('z-index')) > index)) {
            index = parseInt($(this).css('z-index'));
        }
    });

    $('.window[data-current-window="1"]').css('z-index', index+1);
};

F.Window.hide = function(current_window) {
    var process_name = $(current_window).attr('data-process-id');
    var instance_id  = $(current_window).attr('data-instance-id');
    var current_left = $(current_window).css('left');
    var Callback = new FlatOS.Callback();
    $(current_window)
        .attr('data-last-left', current_left)
        .attr('data-active-window', 0);
    Callback.call('onHide', 'ui_'+F.UI.interface+'_window', current_window);
    Callback.call('onHide', process_name+'_'+instance_id, current_window);
    F.Window.switch_to($(current_window).nextAll('.window[data-active-window="1"]').eq(0));
    F.Taskbar.refresh();
};

F.Window.maximize = function(current_window) {
    var process_name = $(current_window).attr('data-process-id');
    var instance_id  = $(current_window).attr('data-instance-id');
    var current_size = parseInt($(current_window).attr('data-window-size'));
    var Callback     = new FlatOS.Callback();
    if (current_size == 0) {
        $(current_window)
            .attr('data-last-position', $(current_window).css('top')+','+$(current_window).css('left'))
            .attr('data-last-size', $(current_window).css('width')+','+$(current_window).css('height'))
            .attr('data-window-size', 1);
        Callback.call('onMaximize', 'ui_'+F.UI.interface+'_window', current_window);
        F.Window.resize_main_content(current_window);
        Callback.call('onMaximize', process_name+'_'+instance_id, current_window);
    }
    else {
        Callback.call('onMinimize', 'ui_'+F.UI.interface+'_window', current_window);
        F.Window.resize_main_content(current_window);
        Callback.call('onMinimize', process_name+'_'+instance_id, current_window);
        $(current_window)
            .removeAttr('data-last-position')
            .removeAttr('data-last-size')
            .attr('data-window-size', 0);
    }
};

F.Window.close = function(current_window) {
    var current_process  = $(current_window).attr('data-process-id'),
        current_instance = $(current_window).attr('data-instance-id'),
        current_pid      = parseInt($(current_window).attr('data-process-nb')),
        index            = current_process+'_'+current_instance;

    var Callback = new FlatOS.Callback();

    Callback.call('onClose', 'ui_'+F.UI.interface+'_window', current_window);
    Callback.call('onClose', index, current_window);

    F.Taskbar.remove(current_process, current_instance);
    $(current_window)
        .fadeOut(300, function() {
            F.Window.switch_to($('.window[data-process-nb="'+(current_pid+1)+'"]'));
            $(current_window).remove();
            F.Taskbar.refresh();
            Callback.removeAll(index);
        });
};

F.Window.restore = function(current_window) {
    var current_left    = $(current_window).attr('data-last-left'),
        current_state   = $(current_window).attr('data-active-window'),
        process_name    = $(current_window).attr('data-process-id'),
        instance_id     = $(current_window).attr('data-instance-id');

    var Callback        = new FlatOS.Callback();

    if (current_state == 0) {
        Callback.call('onRestore', 'ui_'+F.UI.interface+'_window', current_window);
        $(current_window)
            .attr('data-active-window', 1);

    }
    F.Window.switch_to(current_window);
    F.Taskbar.refresh();
};

// Create a namespace
F.Window.Menu = {};
// ------------------

F.Window.Menu.get = function(process_name, isSystemApp) {

    var $app_config = $(F.Application.getInfo(process_name, isSystemApp, 'xml'));

    var $m;

    if (typeof $app_config.find('menu') !== 'undefined') {

        $m = $('<ul></ul>').attr('id', process_name+'_menu');

        $app_config.find('menu').each(function() {
            if (typeof $(this).attr('parent') !== 'undefined') {
                $child  = $('<ul></ul>');
                $new_li = $('<li>'+$(this).attr('name')+'</li>').attr('id', process_name+'_menu_'+$(this).attr('id'));
                $li     = $m.find('li[id='+process_name+'_menu_'+$(this).attr('parent')+']');
                if ($li.children('ul').length > 0) {
                    $li.children('ul').append($new_li);
                }
                else {
                    $child.append($new_li);
                    $li.append($child);
                }
            }
            else {
                $m.append($('<li><span>'+$(this).attr('name')+'</span></li>').attr('id', process_name+'_menu_'+$(this).attr('id')));
            }
        });

    }

    return $m;

}

F.Window.Menu.setAction = function(process_name, instance_id, menu_id, callback) {
    var $window = F.Window.get(process_name, instance_id);
    var $menu = $window.find('#'+process_name+'_menu_'+menu_id);
    var Mouse = new FlatOS.Input.Mouse();

    Mouse.leftClick('window.menu.action', $menu, function() {
        if ($.isFunction(callback)) {
            callback();
        }
    });
};