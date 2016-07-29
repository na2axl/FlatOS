+function ($) {

    FlatOS.System.Application.FileSelectorDialog = function (options, callback) {

        var User = new FlatOS.System.User();

        var defaults = {
            parent_pid: null,
            parent_iid: null,
            withExt: false,
            startAt: User.getTruePath('~/Documents')
        };

        this.options  = $.extend( {}, defaults, options );
        this.callback = callback;

        this._p = new FlatOS.Window(this.options.parent_pid, this.options.parent_iid);
        this._w = new FlatOS.Window('_flatos_file_selector_dialog');

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
            $table = $('#explorer_files_list_'+that.instance);
            $table.hide();
            $div = $('#explorer_file_wait_'+that.instance);
            $div.show();
            if (FS.isDir(path)) {
                var file_list = File.open(path);
                $table = $('#explorer_files_list_'+that.instance);
                $table.hide();
                $div = $('#explorer_file_wait_'+that.instance);
                $div.show();
                $tbody = $('<tbody></tbody>');
                for ( var file in file_list ) {
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

                    Mouse.doubleClick('file_selector.open', $tr.find('td'), function() {
                        getDirFiles($(this).parent('tr').attr('data-internal-path'));
                    });

                    Mouse.leftClick('file_selector.select', $tr.find('td'), function() {
                        $table.find('tr').removeClass('selected');
                        $(this).parent('tr').addClass('selected');
                    });

                    $tr.appendTo($tbody);
                }
                $table.children('tbody').remove();
                $table.append($tbody);
                $div.hide();
                $table.show();
                that._w.setTitle(FS.basename(path) + ' - File Selector');
                that._w.focus();
            }
            else {
                that.callback(path);
                that._w.close();
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
                that._w = new FlatOS.Window('_flatos_file_selector_dialog');

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

                Mouse.leftClick('file_selector.open', $_w.find('div.button.ok'), function() {
                    var $table = $('#explorer_files_list_'+that.instance);
                    var $tr = $table.find('tr.selected');
                    if ($tr.hasClass('selected')) {
                        getDirFiles($tr.attr('data-internal-path'));
                    }
                });
                Mouse.leftClick('file_selector.close', $_w.find('div.button.cancel'), function() {
                    that._w.close();
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