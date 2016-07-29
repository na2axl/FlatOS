+function ($) {

    FlatOS.System.Application.FileSaverDialog = function(options, callback) {

        var User = new FlatOS.System.User();

        var defaults = {
            parent_pid: null,
            parent_iid: null,
            startAt: User.getTruePath('~/Documents'),
            withExt: false,
            contents: '',
            ext: null
        };

        this.options  = $.extend( {}, defaults, options );
        this.callback = callback;

        this._p = new FlatOS.Window(this.options.parent_pid, this.options.parent_iid);
        this._w = new FlatOS.Window('_flatos_file_saver_dialog');

        var that = this;

        if (this.options.withExt === false || typeof this.options.withExt !== 'object') {
            var exts   = new FlatOS.System.Application.DefaultAppsManager();
            var RegExt = exts.getRegExt(this.options.parent_pid);
        }
        else {
            var RegExt = this.options.withExt;
        }

        // Saving old events callbacks
        var Callback     = new FlatOS.Callback();
        var save_onFocus = Callback.get('onFocus', that.options.parent_pid+'_'+that.options.parent_iid);

        // The filesystem manager instance
        var FS   = new FlatOS.System.FS();
        var File = new FlatOS.System.File();

        // Mouse triggers
        var Mouse = new FlatOS.Input.Mouse();

        var $table, $tbody, $tr, $div;

        var getDirFiles = function (path) {
            F.Cache.Explorer[path] = [];
            $table = $('#explorer_files_list_'+that.instance);
            $table.hide();
            $div = $('#explorer_file_wait_'+that.instance);
            $div.show();
            var file_list = File.open(path);
            $table = $('#explorer_files_list_'+that.instance);
            $table.attr('data-current-path', path);
            $table.hide();
            $div = $('#explorer_file_wait_'+that.instance);
            $div.show();
            $tbody = $('<tbody></tbody>');
            for ( var file in file_list ) {
                F.Cache.Explorer[path].push(file_list[file].path);
                var f = file_list[file];
                if (RegExt !== true) {
                    if (!~RegExt.indexOf(f.type) && f.type != 'folder') {
                        delete file_list[file];
                    }
                }
            }
            for ( var file in file_list ) {
                var icon = new FlatOS.UI.Icon({path: file_list[file].path, contextMenu: false, dblClick: false});
                $tr = $('<tr data-file-basename="'+file+'" data-internal-path="'+file_list[file].path+'"></tr>');
                $tr
                    .append($('<td>'+file+'</td>').prepend(icon.getFileIcon()))
                    .append('<td>'+file_list[file].type+'</td>')
                    .append('<td>'+file_list[file].size+'</td>');

                Mouse.doubleClick('file_selector.open', $tr.children('td'), function() {
                    if (FS.isDir($(this).parent('tr').attr('data-internal-path'))) {
                        getDirFiles($(this).parent('tr').attr('data-internal-path'));
                    }
                    else {
                        saveFile($(this).parent('tr').attr('data-internal-path'));
                    }
                });

                Mouse.leftClick('file_selector.select', $tr.children('td'), function() {
                    $table.find('tr').removeClass('selected');
                    $(this).parent('tr').addClass('selected');
                });

                $tr.appendTo($tbody);
            }
            $table.children('tbody').remove();
            $table.append($tbody);
            $div.hide();
            $table.show();
            that._w.setTitle(FS.basename(path) + ' - File Saver');
            that._w.focus();
        };

        var saveFile = function(path) {
            if (FS.isDir(path)) {
                getDirFiles(path);
            }
            else {
                var filename = path;
                if (that.options.ext) {
                    if (FS.extension(path) != that.options.ext) {
                        filename = path + '.' + that.options.ext;
                    }
                }
                var Saver = new FlatOS.Api.File(function (isSaved) {
                    if ($.isFunction(that.callback)) {
                        that.callback(isSaved, filename);
                    }
                    that._w.close();
                });
                if (FS.exists(path)) {
                    that._w.dialogConfirm( {
                        title: 'Overwrite the file ?',
                        content: 'This file already exists. Do you want to replace the old file ?'
                    }, function (confirm) {
                        if (confirm) {
                            Saver.save(filename, that.options.contents);
                        }
                    } );
                }
                else {
                    Saver.save(filename, that.options.contents);
                }
            }
        };

        this._w.instanciate({
            isSystemApp: true,
            taskbar: false,
            resizable: false,
            maximizable: false,
            minimizable: false,
            async: true,
            controls: ['close'],
            callback: function() {
                that._w = new FlatOS.Window('_flatos_file_saver_dialog');

                that.instance = that._w.getInstanceID();

                // Unbind callbacks events
                that._p.unbind('focus');

                // Adding new events callbacks
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
                        that._p.focus();
                    }, 500);

                });

                var $_w = that._w.get();

                $_w.find('div.button.ok').click(function() {
                    var filepath = User.getTruePath('~');
                    if (that._w.get().find('input[name="file_name"]').val() == '') {
                        $table = $('#explorer_files_list_'+that.instance);
                        $tr = $table.find('tr.selected');
                        filepath = $tr.attr('data-internal-path');
                    }
                    else {
                        filepath = $('#explorer_files_list_'+that.instance).attr('data-current-path') + '/' + that._w.get().find('input[name="file_name"]').val();
                    }
                    saveFile(filepath);
                });
                $_w.find('div.button.cancel').click(function() {
                    that._w.close();
                });

                $_w.find('form#file_save_form_'+that.instance).submit(function(e) {
                    e.preventDefault();
                    saveFile($('#explorer_files_list_'+that.instance).attr('data-current-path') + '/' + that._w.get().find('input[name="file_name"]').val());
                });

                new FlatOS.Api.User(function (file_list) {
                    $table = $('#explorer_user_folders_'+that.instance);
                    $tbody = $('<tbody></tbody>');
                    for ( var file in file_list ) {
                        $tr = $('<tr data-file-basename="'+file+'" data-internal-path="'+file_list[file].path+'"></tr>');
                        if (FS.exists('system/ui/'+F.UI.icons+'/icons/'+file_list[file].icon+'.svg')) {
                            $tr.append('<td><img src="system/ui/'+F.UI.icons+'/icons/'+file_list[file].icon+'.svg" style="width:32px; height: 32px; vertical-align: middle; margin-right: 5px;">'+file+'</td>')
                        }
                        else {
                            $tr.append('<td><img src="system/ui/'+F.UI.icons+'/icons/folder.svg" style="width:32px; height: 32px; vertical-align: middle; margin-right: 5px;">'+file+'</td>')
                        }

                        Mouse.leftClick('file_selector.select', $tr.children('td'), function() {
                            $('#explorer_user_folders_'+that.instance).find('tr').removeClass('selected');
                            $(this).parent('tr').addClass('selected');
                            getDirFiles($(this).parent('tr').attr('data-internal-path'));
                        });

                        $tr.appendTo($tbody);
                    }
                    $table.children('tbody').remove();
                    $table.append($tbody);
                    that._w.focus();
                }).listUserDir();

                getDirFiles(that.options.startAt);

            }
        });

    };

}(jQuery);