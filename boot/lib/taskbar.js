// Create a namespace
F.Taskbar = {};
// ------------------

F.Taskbar.load = function() {
    $("#startmenu").css('background-image', 'url("system/ui/'+F.UI.icons+'/icons/startmenu.png")');
};

F.Taskbar.refresh = function() {
    var current_process  = $('.window[data-current-window="1"]').attr('data-process-id');
    var current_instance = $('.window[data-current-window="1"]').attr('data-instance-id');

    var Callback = new FlatOS.Callback();

    $('.taskbar-icons').children('.taskicon').removeClass('current opened');

    $('.window').each(function(){
        var process_id  = $(this).attr('data-process-id'),
            instance_id = $(this).attr('data-instance-id'),
            $taskicons  = F.Taskbar.get(process_id, instance_id),
            _w = new FlatOS.Window(process_id, instance_id);
        $taskicons.addClass('opened');
        if (!$taskicons.hasClass('hinted')) {
            $taskicons.tooltipster('content', _w.getTitle());
        }
    });

    if (typeof current_process !== 'undefined') {
        $taskicon = $('.taskbar-icons').children('.taskicon[data-process-id="'+current_process+'"]');
        if (typeof current_instance !== 'undefined') {
            $taskicon = $('.taskbar-icons').children('.taskicon[data-process-id="'+current_process+'"][data-instance-id="'+current_instance+'"]');
        }
        $taskicon.addClass('current');
    }

    $('.taskbar-icons').children('.taskicon[data-process-opener="1"]').unbind('click').click(function() {
        F.Application.load({
            process_name: $(this).attr('data-process-id')
        });
    });

    $('.taskbar-icons').children('.taskicon').unbind('click').click(function() {
        var current_process  = $(this).attr('data-process-id'),
            current_instance = $(this).attr('data-instance-id'),
            $window          = F.Window.get(current_process, current_instance),
            current_state    = parseInt($window.attr('data-active-window')),
            current_id       = parseInt($window.attr('data-current-window'));
        if (current_state === 0) {
            F.Window.restore($window, Callback.get('onRestore', current_process+'_'+current_instance));
        }
        else {
            if (current_id === 1) {
                F.Window.hide($window, Callback.get('onRestore', current_process+'_'+current_instance));
            }
            else {
                F.Window.switch_to($window);
            }
        }
    });
};

F.Taskbar.get = function(process_name, instance_id) {
    return $('.taskbar-icons').find('#flatos_task_' + process_name + '_' + instance_id);
};

F.Taskbar.alarm = function(process_name, instance_id) {
    $task = F.Taskbar.get(process_name, instance_id);
    $task.removeClass('slideInLeft').addClass('infinite flash hinted').click(function() {
        $task.removeClass('infinite flash hinted');
        F.Taskbar.refresh();
    });
    setTimeout(function() {
        $task.removeClass('infinite flash');
    }, 10000);
    F.Window.on('focus', process_name, function() { $task.removeClass('infinite flash hinted'); F.Taskbar.refresh(); }, instance_id);
};

F.Taskbar.setTitle = function(title, process_name, instance_id) {
    F.Taskbar.get(process_name, instance_id).tooltipster('content', title);
};

F.Taskbar.is = function(process_name, instance_id) {
    if (typeof instance_id === 'undefined') {
        return $('.taskbar-icons').children('.taskicon').is('.taskicon[data-process-id="'+process_name+'"]');
    }
    else {
        return $('.taskbar-icons').children('.taskicon').is('.taskicon[data-process-id="'+process_name+'"][data-instance-id="'+instance_id+'"]');
    }
};

F.Taskbar.add = function(process_name, instance_id) {
    var app_info = F.Application.getInfo(process_name);

    var $taskicon = $('<div></div>');

    var _w = new FlatOS.Window(process_name, instance_id);

    if (typeof instance_id !== 'undefined') {
        $taskicon.attr('data-instance-id', instance_id);
        _w = new FlatOS.Window(process_name, instance_id);
    }

    $taskicon
        .css('display', 'none')
        .addClass('taskicon')
        .append('<span class="loading"></span>')
        .append('<span class="icon"><img src="'+app_info.app_icon+'" /></span>')
        .attr('title', app_info.app_name)
        .attr('data-process-id', process_name)
        .attr('id', 'flatos_task_' + process_name + '_' + instance_id)
        .appendTo('.taskbar-icons')
        .tooltipster({
            position: 'right',
            theme: 'taskicon-tooltip',
            content: _w.getTitle(),
            contentAsHTML: true
        })
        .addClass('animated slideInLeft')
        .css('display', 'block');

    F.Taskbar.refresh();
};

F.Taskbar.remove = function(process_name, instance_id) {
    $taskicon = $('.taskbar-icons').children('.taskicon[data-process-id="'+process_name+'"]');
    if (typeof instance_id !== 'undefined') {
        $taskicon = $('.taskbar-icons').children('.taskicon[data-process-id="'+process_name+'"][data-instance-id="'+instance_id+'"]');
    }
    if ($taskicon.parent().attr('id') == 'pinnedapps') {
        $taskicon.removeClass('current').attr('data-process-opener', 1);
    }
    else {
        $taskicon
            .removeClass('slideInLeft')
            .addClass('slideOutLeft')
            .remove();
    }
    F.Taskbar.refresh();
};