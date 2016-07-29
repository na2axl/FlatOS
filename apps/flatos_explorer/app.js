if (typeof folders_cache === 'undefined') {
    var folders_cache = {};
}
if (typeof ctx_menu  === 'undefined') {
    var ctx_menu = {};
}

(function($) {

    const this_process_name = 'flatos_explorer';

    var _w = new FlatOS.Window(this_process_name),
        _a = new FlatOS.Application(this_process_name),
        _i = new FlatOS.System.Icons(this_process_name),
        _m = new FlatOS.Mouse();

    var instance = _w.getInstanceID(),
        $_w = _w.get(),
        curr_folder;

    var goUp = function() {
        var folders = curr_folder.split('/');
        if (folders.length > 3) {
            folders.pop();
            folders = folders.join('/');
            openFolder(folders);
        }
    };

    var openFolder = function(path, refresh) {
        $_w.find('.flatos_file_explorer_icons_list').hide();
        $_w.find('.flatos_file_explorer_file_wait').show();
        if (typeof folders_cache[path] === 'undefined' || refresh == true) {
            var user = new FlatOS.User();
            if (typeof path === 'undefined' || path == '') {
                path = user.userDir();
            }
            var path_info = new FlatOS.File(path);
            var folder = new FlatOS.ApiFile(function(file_list) {
                var $ul = $('<ul class="icons medium"></ul>');
                delete file_list['..'];
                for ( var file in file_list ) {
                    var icon = new FlatOS.Icon({path: file_list[file].path, dblClick: false});
                    var $li = $('<li data-file-basename="'+file+'" data-internal-path="'+file_list[file].path+'"></li>');
                    $li.append(icon.getFileIcon()).append('<span>'+file+'</span>');
                    $li
                        .dblclick(function() {
                            var filename = new FlatOS.File($(this).attr('data-internal-path'));
                            if (filename.isDir()) {
                                openFolder($(this).attr('data-internal-path'));
                            }
                            else {
                                app = new FlatOS.System.DefaultAppsManager();
                                app.openWithDefault($(this).attr('data-internal-path'));
                            }
                        })
                        .click(function() {
                            $ul.find('li').removeClass('selected');
                            $(this).addClass('selected');
                        });
                    $li.appendTo($ul);
                    ctx_menu[file_list[file].path] = icon.getContextMenu();
                }
                $_w.find('.flatos_file_explorer_icons_list').children('ul').remove();
                $ul.appendTo($_w.find('.flatos_file_explorer_icons_list'));
                curr_folder = path;
                ext_path = path_info.externalPath();
                ext_path_parts = ext_path.split('/');
                _w.setTitle(ext_path_parts[ext_path_parts.length-1] + ' - File Explorer');
                var $u = $('<ul class="folders_list"></ul>');
                for (var i = 0, l = ext_path_parts.length; i < l; i++) {
                    var $l = $('<li data-file-basename="'+ext_path_parts[i]+'" data-internal-path="'+curr_folder.substring(0, curr_folder.lastIndexOf(ext_path_parts[i]) + ext_path_parts[i].length)+'">'+ext_path_parts[i].substr(0, 15)+'</li>');
                    $l
                        .click(function() {
                            openFolder($(this).attr('data-internal-path'));
                        })
                        .appendTo($u);
                    if (typeof ext_path_parts[i+1] != 'undefined') {
                        $u.append('<li class="separator">&gt;</li>');
                    }
                }
                $_w.find('.flatos_file_explorer_control_folder').children('ul').remove();
                $u.appendTo($_w.find('.flatos_file_explorer_control_folder'));
                folders_cache[path] = {
                    name: ext_path_parts[ext_path_parts.length-1],
                    files: $ul,
                    path_control: $u
                };
                $_w.find('.flatos_file_explorer_file_wait').hide();
                $_w.find('.flatos_file_explorer_icons_list').show();
            });
            folder.open(path);
        }
        else {
            curr_folder   = path;
            this_folder   = folders_cache[path];
            _w.setTitle(this_folder.name + ' - File Explorer');
            $_w.find('.flatos_file_explorer_icons_list').children('ul').remove();
            $(this_folder.files)
            .clone()
            .appendTo($_w.find('.flatos_file_explorer_icons_list'))
            .find('li')
            .removeClass('selected')
            .each(function() {
                var $ul = $(this).parent();
                $(this)
                    .unbind()
                    .dblclick(function() {
                        var filename = new FlatOS.File($(this).attr('data-internal-path'));
                        if (filename.isDir()) {
                            openFolder($(this).attr('data-internal-path'));
                        }
                        else {
                            app = new FlatOS.System.DefaultAppsManager();
                            app.openWithDefault($(this).attr('data-internal-path'));
                        }
                    })
                    .click(function() {
                        $ul.find('li').removeClass('selected');
                        $(this).addClass('selected');
                    })
                    .contextualMenu(ctx_menu[$(this).attr('data-internal-path')]);
            });
            $_w.find('.flatos_file_explorer_control_folder').children('ul').remove();
            $(this_folder.path_control).find('li').each(function() {
                $(this)
                    .unbind()
                    .click(function() {
                        openFolder($(this).attr('data-internal-path'));
                    });
            });
            $(this_folder.path_control).clone(true).appendTo($_w.find('.flatos_file_explorer_control_folder'));
            $_w.find('.flatos_file_explorer_file_wait').hide();
            $_w.find('.flatos_file_explorer_icons_list').show();
        }
    };

    var User = new FlatOS.ApiUser(function(file_list) {
        $table = $_w.find('.explorer_user_folders');
        $tbody = $('<tbody></tbody>');
        for ( var file in file_list ) {
            var icon = new FlatOS.Icon(file_list[file].path);
            var $tr = $('<tr data-file-basename="'+file+'" data-internal-path="'+file_list[file].path+'"></tr>');
            $tr.append($('<td>'+file+'</td>').prepend(icon.getIcon('folder_'+file.toLowerCase())));

            $tr.children('td')
                .click(function() {
                    $_w.find('.explorer_user_folders').find('tr').removeClass('selected');
                    $(this).parent('tr').addClass('selected');
                    openFolder($(this).parent('tr').attr('data-internal-path'));
                });
            $tr.appendTo($tbody);
        }
        $table.children('tbody').remove();
        $table.append($tbody);
    });

    User.listUserDir();

    $_w.find('.control_up').append(_i.getIcon('arrow-up')).click(function() {
        goUp();
    });
    $_w.find('.control_undo').append(_i.getIcon('undo')).click(function() {
        goUp();
    });
    $_w.find('.control_redo').append(_i.getIcon('redo')).click(function() {
        goUp();
    });

    _m.contextualMenu(
        $_w.find('.flatos_file_explorer_files_list'),
        {
            create: {
                new_folder: {
                    name: 'New Folder',
                    callback: function() {
                    }
                },
                new_file: {
                    name: 'New File',
                    callback: function() {
                    }
                }
            },
            manage: {
                refresh: {
                    name: 'Refresh',
                    callback: function() {
                        openFolder(curr_folder, true);
                    }
                }
            },
            properties: {
                prop: {
                    name: 'Properties',
                    callback: function() {
                    }
                }
            }
        }
    );

    _w.on('init', openFolder);

    _a.registerCommand('open', openFolder);

})(jQuery);