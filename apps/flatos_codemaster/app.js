(function($) {

    var _window = new FlatOS.Window('flatos_codemaster'),
        _application = new FlatOS.Application('flatos_codemaster'),
        //_icons = new FlatOS.System.Icons('flatos_codemaster'),
        _mouse = new FlatOS.Input.Mouse(),
        _taskbar = new FlatOS.UI.TaskBar('flatos_codemaster');

    var instance = _window.getInstanceID(),
        user_config = _application.getUserConfig();

    var panelNB = 0,
        currPanel = 0,
        prevpanel;

    var file_info = [];

    var langs = ['abap', 'abc', 'actionscript', 'ada', 'apache_conf', 'assembly_x86',
                 'batchfile',
                 'c_cpp', 'clojure', 'cobol', 'coffee', 'coldfusion', 'csharp', 'css',
                 'd', 'dart', 'diff', 'django', 'dockerfile',
                 'eiffel', 'ejs', 'elixir',
                 'forth', 'ftl',
                 'gcode', 'gitignore', 'glsl', 'golang', 'groovy',
                 'haml', 'haskell', 'haxe', 'html',
                 'ini', 'io',
                 'jade', 'java', 'javascript', 'json', 'jsp', 'jsx',
                 'latex', 'less', 'liquid', 'lisp', 'livescript', 'lua',
                 'makefile', 'markdown', 'mask', 'matlab', 'mel',
                 'nix',
                 'objectivec', 'ocaml',
                 'pascal', 'perl', 'php', 'powershell', 'python',
                 'r', 'ruby',
                 'sass', 'scala', 'scss', 'sh', 'smarty', 'sql', 'svg',
                 'tcl', 'tex', 'text', 'textile', 'twig', 'typescript',
                 'vbscript',
                 'xml', 'xquery',
                 'yaml'];


    var exts =  {'abap': 'abap', 'abc': 'abc', 'as': 'actionscript', 'ada': 'ada', 'asm': 'assembly_x86', 'conf': 'apache_conf', 'htaccess': 'apache_conf',
                 'sh': 'sh',
                 'cpp': 'c_cpp', 'c': 'c_cpp', 'h': 'cpp', 'clj': 'clojure', 'cbl': 'cobol', 'coffee': 'coffee', 'cfm': 'coldfusion', 'cs': 'csharp', 'css': 'css',
                 'd': 'd', 'dart': 'dart', 'diff': 'diff',
                 'e': 'eiffel', 'ejs': 'ejs', 'ex': 'elixir',
                 'frt': 'forth', 'ftl': 'ftl',
                 'gcode': 'gcode', 'gitignore': 'gitignore', 'glsl': 'glsl', 'go': 'golang', 'groovy': 'groovy',
                 'haml': 'haml', 'hs': 'haskell', 'hx': 'haxe', 'html': 'html',
                 'ini': 'ini', 'io': 'io',
                 'jade': 'jade', 'java': 'java', 'js': 'javascript', 'json': 'json', 'jsp': 'jsp', 'jsx': 'jsx',
                 'tex': 'latex', 'less': 'less', 'liquid': 'liquid', 'lisp': 'lisp', 'ls': 'livescript', 'lua': 'lua',
                 'md': 'markdown', 'mask': 'mask', 'matlab': 'matlab', 'mel': 'mel',
                 'nix': 'nix',
                 'm': 'objectivec', 'ml': 'ocaml',
                 'pas': 'pascal', 'pl': 'perl', 'php': 'php', 'ps1': 'powershell', 'py': 'python',
                 'r': 'r', 'rb': 'ruby',
                 'sass': 'sass', 'scala': 'scala', 'scss': 'scss', 'tpl': 'smarty', 'sql': 'sql', 'svg': 'svg',
                 'tcl': 'tcl', 'txt': 'text', 'textile': 'textile', 'twig': 'twig', 'ts': 'typescript',
                 'vbs': 'vbscript',
                 'xml': 'xml','xq': 'xquery',
                 'yaml': 'yaml' };

    var update_panels = function (panel_id) {

        var $wrapper = _window.get().find(".panels"),
        $parent = $wrapper.parent('.panel-wrapper'),
        $panels = $wrapper.find('.panel'),
        $buttons = $parent.find('.panel-switcher');

        $buttons.removeClass('active');
        $buttons.filter('[href="' + panel_id + '"]').addClass('active');

        $panels.hide(0, function() {
            $(panel_id).show(0, function() {
                currPanel = parseInt(panel_id.substring(panel_id.lastIndexOf('_')+1));
                if (typeof file_info[currPanel] === 'undefined') {
                    _window.setTitle('CodeMaster');
                }
                else {
                    if (typeof file_info[currPanel].path !== 'undefined') {
                        _window.setTitle(file_info[currPanel].path + ' - CodeMaster');
                    }
                    else {
                        _window.setTitle('CodeMaster');
                    }
                }
                _window.get().find('.flatos_codemaster_dialog').hide(0);
                _taskbar.setTitle(_window.getTitle());
            });
        });

    };

    var init_panels = function() {

        var $wrapper = $(_window.get().find(".panels")),
        $parent = $wrapper.parent('.panel-wrapper'),
        $panels = $wrapper.find('.panel'),
        $buttons = $parent.find('.panel-switcher');

        var currpanelid = '#' + $panels.eq(currPanel-1).attr('id');

        if (typeof prevpanel === 'undefined') {
            prevpanel = currpanelid;
        }

        $buttons.each(function() {
            var $a = $(this);
            _mouse.leftClick('codemaster.panels.switch', $a, function(e) {
                e.preventDefault();
                e.stopPropagation();
                if ($a.hasClass('disable-switch')) {
                    return false;
                }
                else {
                    prevpanel = currpanelid;
                    update_panels($a.attr('href'));
                    editor[currPanel].focus();
                }
            });
        });

    };

    var close_panel = function(panel_id) {
        var id = 'flatos_codemaster_' + instance + '_panel_' + panel_id;
        _window.get().find('a[href="#' + id + '"]').parent().remove();
        _window.get().find('#' + id).remove();
        init_panels();
    };

    var add_panel = function(panel_title) {
        panelNB++;

        if (typeof panel_title === 'undefined') {
            panel_title = 'Untitled';
        }
        var id = 'flatos_codemaster_' + instance + '_panel_' + panelNB;
        _window.get().find('.nav-panel').append('<li><a href="#'+id+'" class="active panel-switcher"><span id="flatos_codemaster_editor_panel_'+panelNB+'" >'+panel_title+'</span><span class="flatos_codemaster_close_dialog"></span></a></li>');
        _window.get().find('.panels').append('<article id="'+id+'" class="panel"><pre id="flatos_codemaster_editor'+instance+'_panel_'+panelNB+'" class="flatos_codemaster_editor"></pre></article>');
        _mouse.leftClick('codemaster.panels.close', _window.get().find('span#flatos_codemaster_editor_panel_'+panelNB).next(), function(e) {
            e.preventDefault();
            var _id = $(this).prev().attr('id');
            close_panel(parseInt(_id.substring(_id.lastIndexOf('_')+1)));
        });

        update_panels('#' + id);
        init_panels();

        if (typeof file_info[currPanel] === 'undefined') {
            file_info[currPanel] = {};
        }

        editor[currPanel] = ace.edit('flatos_codemaster_editor' + instance + '_panel_' + panelNB);
        editor[currPanel].getSession().setMode("ace/mode/"+user_config.default_lang);
        editor[currPanel].getSession().setTabSize(user_config.indent_size);
        editor[currPanel].getSession().setUseSoftTabs(user_config.use_soft_tabs);
        editor[currPanel].setTheme("ace/theme/"+user_config.editor_theme);
        editor[currPanel].setHighlightActiveLine(user_config.highlight_active_line);
        editor[currPanel].setBehavioursEnabled(user_config.autocomplete);
        editor[currPanel].setDisplayIndentGuides(user_config.show_indent_guides);
        editor[currPanel].setFontSize(parseInt(user_config.font_size));
        editor[currPanel].setShowInvisibles(user_config.show_invisibles);
        editor[currPanel].setShowPrintMargin(user_config.show_print_margin);
        editor[currPanel].$blockScrolling = Infinity;

        editor[currPanel].getSession().on("change", function(e) {
            var title = '';
            if (typeof file_info[currPanel].name === 'undefined') {
                title = 'Untitled';
            }
            else {
                title = file_info[currPanel].name+'.'+file_info[currPanel].type;
            }
            set_panel_title(currPanel, '<b><span class="not_saved">[*] </span><span>'+title+'</span></b>');
            editor[currPanel].resize(true);
        });

        // Find and Replace Capability
        editor[currPanel].commands.addCommand({
            name: 'find_and_replace',
            bindKey: {win: 'Ctrl-H',  mac: 'Command-H'},
            exec: function(editor) {
                var $dialog = _window.get().find('div.find_and_replace_dialog'),
                    text = editor.session.getTextRange(editor.getSelectionRange()),
                    options = {
                        backwards: false,
                        wrap: false,
                        caseSensitive: false,
                        wholeWord: false,
                        regExp: false
                    };

                $dialog.find('form').submit(function(e) {
                    e.preventDefault();
                });
                $dialog.find('input[name="find_this"]').keyup(function() {
                    if (typeof searchTimeOut !== 'undefined') {
                        clearTimeout(searchTimeOut);
                    }

                    var searchTimeOut = setTimeout(function() {
                        var find_text = $dialog.find('input[name="find_this"]').val()
                        editor.find(find_text, options);
                    }, 500);
                });
                _mouse.leftClick('codemaster.finder.findOnce', $dialog.find('button[name="find_once"]'), function() {
                    var find_text = $dialog.find('input[name="find_this"]').val()
                    editor.find(find_text, options);
                });
                _mouse.leftClick('codemaster.finder.findAll', $dialog.find('button[name="find_all"]'), function() {
                    var find_text = $dialog.find('input[name="find_this"]').val()
                    editor.findAll(find_text, options);
                });
                _mouse.leftClick('codemaster.finder.replaceOnce', $dialog.find('button[name="replace_once"]'), function() {
                    var replace_text = $dialog.find('input[name="replace_with"]').val()
                    editor.replace(replace_text);
                    var find_text = $dialog.find('input[name="find_this"]').val()
                    editor.find(find_text, options);
                });
                _mouse.leftClick('codemaster.finder.replaceAll', $dialog.find('button[name="replace_all"]'), function() {
                    var replace_text = $dialog.find('input[name="replace_with"]').val()
                    editor.replaceAll(replace_text);
                });
                _mouse.leftClick('codemaster.finder.regex', $dialog.find('input[name="with_regex"]'), function () {
                    var c = $(this),
                        e = c.prop("checked");

                    if (e) {
                        options['regExp'] = true;
                    }
                    else {
                        options['regExp'] = false;
                    }

                    var find_text = $dialog.find('input[name="find_this"]').val()
                    editor.find(find_text, options);
                });
                _mouse.leftClick('codemaster.finder.cs', $dialog.find('input[name="case_sens"]'), function () {
                    var c = $(this),
                        e = c.prop("checked");

                    if (e) {
                        options['caseSensitive'] = true;
                    }
                    else {
                        options['caseSensitive'] = false;
                    }

                    var find_text = $dialog.find('input[name="find_this"]').val()
                    editor.find(find_text, options);
                });
                _mouse.leftClick('codemaster.finder.wholeWord', $dialog.find('input[name="whole_word"]'), function () {
                    var c = $(this),
                        e = c.prop("checked");

                    if (e) {
                        options['wholeWord'] = true;
                    }
                    else {
                        options['wholeWord'] = false;
                    }

                    var find_text = $dialog.find('input[name="find_this"]').val()
                    editor.find(find_text, options);
                });
                _mouse.leftClick('codemaster.finder.wrapEnd', $dialog.find('input[name="wrap_end"]'), function () {
                    var c = $(this),
                        e = c.prop("checked");

                    if (e) {
                        options['wrap'] = true;
                    }
                    else {
                        options['wrap'] = false;
                    }

                    var find_text = $dialog.find('input[name="find_this"]').val()
                    editor.find(find_text, options);
                });
                _mouse.leftClick('codemaster.finder.direction', $dialog.find('input[name="direction"]'), function () {
                    var c = $(this),
                        e = c.val();

                    if (e == 'next') {
                        options['backwards'] = false;
                    }
                    else {
                        options['backwards'] = true;
                    }

                    var find_text = $dialog.find('input[name="find_this"]').val()
                    editor.find(find_text, options);
                });
                _mouse.leftClick('codemaster.finder.close', $dialog.find('.flatos_codemaster_close_dialog'), function() {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                });
                $dialog.find('form').submit(function(e) {
                    e.preventDefault();
                });

                if ($dialog.css('display') == 'none') {
                    _window.get().find('div.flatos_codemaster_dialog').hide();
                    $dialog.find('input[name="find_this"]').val('');
                    $dialog.find('input[name="replace_with"]').val('');
                    $dialog.show();
                    $dialog.keydown(function( event ) {
                        if ( event.keyCode == 27 ) {
                            $dialog.hide();
                            $dialog.unbind('keydown');
                            editor.focus();
                        }
                    });
                }
                else {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                }

                if ((typeof text === 'undefined') || (text == '')) {
                    $dialog.find('input[name="find_this"]').focus();
                }
                else {
                    $dialog.find('input[name="find_this"]').focus().val(text);
                    editor.find(text, options);
                }
            },
            readOnly: false
        });

        // Open
        editor[currPanel].commands.addCommand({
            name: 'open',
            bindKey: {win: 'Ctrl-O',  mac: 'Command-O'},
            exec: function(editor) { openFile(); },
            readOnly: true
        });

        // New
        editor[currPanel].commands.addCommand({
            name: 'new',
            bindKey: {win: 'Ctrl-N',  mac: 'Command-N'},
            exec: function(editor) { add_panel(); init_panels(); },
            readOnly: true
        });

        // Save
        editor[currPanel].commands.addCommand({
            name: 'save',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(editor) {
                var $dialog = _window.get().find('div.message_dialog'),
                    isSaved;

                $dialog.find('.flatos_codemaster_close_dialog').unbind('click').click(function() {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                });

                if (typeof file_info[currPanel].internalPath !== 'undefined') {
                    var save = new FlatOS.System.File();
                    isSaved = save.save(file_info[currPanel].internalPath, editor.getValue());
                    if (isSaved === true) {
                        $dialog.find('div[name="message"]').text('File saved succesfully.');
                        set_panel_title(currPanel, file_info[currPanel].name+'.'+file_info[currPanel].type);
                    }
                    else {
                        $dialog.find('div[name="message"]').text('Cannot save the file.');
                    }
                    $dialog.show();
                    if (typeof hide === 'undefined') {
                        var hide = setTimeout(function() {
                            $dialog.hide();
                        }, 5000);
                    }
                    else {
                        clearTimeout(hide);
                        var hide = setTimeout(function() {
                            $dialog.hide();
                        }, 5000);
                    }
                }
                else {
                    editor.execCommand('save_as');
                }
            },
            readOnly: true
        });

        // Save as
        editor[currPanel].commands.addCommand({
            name: 'save_as',
            bindKey: {win: 'Ctrl-Shift-S',  mac: 'Command-Shift-S'},
            exec: function(editor) {
                var $dialog = _window.get().find('div.message_dialog');

                $dialog.find('.flatos_codemaster_close_dialog').unbind('click').click(function() {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                });

                var opts = {parent_pid: 'flatos_codemaster', parent_iid: instance, contents: editor.getValue()};
                if (typeof file_info[currPanel].internalPath !== 'undefined') {
                    var file = new FlatOS.System.FS();
                    opts.startAt = file.dirname(file_info[currPanel].internalPath);
                }
                var selector = new FlatOS.System.Application.FileSaverDialog(opts, function(isSaved, path) {
                    if (isSaved === true) {
                        $dialog.find('div[name="message"]').text('File saved succesfully.');
                        set_panel(_window.get().find('a.panel-switcher.active').attr('href'), path);
                    }
                    else {
                        $dialog.find('div[name="message"]').text('Cannot save the file.');
                    }
                    $dialog.show();
                    if (typeof hide === 'undefined') {
                        var hide = setTimeout(function() {
                            $dialog.hide();
                        }, 5000);
                    }
                    else {
                        clearTimeout(hide);
                        var hide = setTimeout(function() {
                            $dialog.hide();
                        }, 5000);
                    }
                    editor.resize(true);
                    editor.focus();
                });
            },
            readOnly: true
        });

        // Show Settings
        editor[currPanel].commands.addCommand({
            name: 'showSettingsMenu',
            bindKey: {win: 'Ctrl-,',  mac: 'Command-,'},
            exec: function(editor) {
                var $dialog = _window.get().find('div.notepad_preferences_dialog'),
                    new_config = user_config;

                $dialog.find('.flatos_codemaster_close_dialog').unbind('click').click(function() {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                });

                $dialog.find('option[value='+user_config.default_lang+']').prop('selected', true);
                $dialog.find('option[value='+user_config.editor_theme+']').prop('selected', true);
                $dialog.find('option[value='+user_config.font_size+']').prop('selected', true);
                $dialog.find('option[value='+user_config.indent_size+']').prop('selected', true);

                $dialog.find('select[name="default_lang"]').change(function() {
                    new_config.default_lang = $(this).val();
                });
                $dialog.find('select[name="editor_theme"]').change(function() {
                    editor.setTheme("ace/theme/"+$(this).val());
                    new_config.editor_theme = $(this).val();
                });
                $dialog.find('select[name="font_size"]').change(function() {
                    editor.setFontSize(parseInt($(this).val()));
                    new_config.font_size = $(this).val();
                });
                $dialog.find('select[name="indent_size"]').change(function() {
                    editor.getSession().setTabSize($(this).val());
                    new_config.indent_size = $(this).val();
                });

                $dialog.find('input[name="highlight_active_line"]').prop('checked', user_config.highlight_active_line).unbind('click').click(function() {
                    editor.setHighlightActiveLine($(this).prop('checked'));
                    new_config.highlight_active_line = $(this).val();
                });
                $dialog.find('input[name="show_invisibles"]').prop('checked', user_config.show_invisibles).unbind('click').click(function() {
                    editor.setShowInvisibles($(this).prop('checked'));
                    new_config.show_invisibles = $(this).prop('checked');
                });
                $dialog.find('input[name="show_indent_guides"]').prop('checked', user_config.show_indent_guides).unbind('click').click(function() {
                    editor.setDisplayIndentGuides($(this).prop('checked'));
                    new_config.show_indent_guides = $(this).prop('checked');
                });
                $dialog.find('input[name="show_print_margin"]').prop('checked', user_config.show_print_margin).unbind('click').click(function() {
                    editor.setShowPrintMargin($(this).prop('checked'));
                    new_config.show_print_margin = $(this).prop('checked');
                });
                $dialog.find('input[name="use_soft_tabs"]').prop('checked', user_config.use_soft_tabs).unbind('click').click(function() {
                    editor.getSession().setUseSoftTabs($(this).prop('checked'));
                    new_config.use_soft_tabs = $(this).prop('checked');
                });
                $dialog.find('input[name="autocomplete"]').prop('checked', user_config.autocomplete).unbind('click').click(function() {
                    editor.setBehavioursEnabled($(this).prop('checked'));
                    new_config.autocomplete = $(this).prop('checked');
                });

                $dialog.find('button[name="save_config"]').unbind('click').click(function() {
                    isSaved = _application.setUserConfig(JSON.stringify(new_config));
                    if (isSaved === true) {
                        $dialog.find('div[name="save_reset_message"]').text('Config file saved succesfully');
                    }
                    else {
                        $dialog.find('div[name="save_reset_message"]').text('Config file saved succesfully');
                    }
                });

                $dialog.find('button[name="reset_config"]').unbind('click').click(function() {
                    isSaved = _application.setUserConfig(JSON.stringify(_application.getUserDefaultConfig()));
                    if (isSaved === true) {
                        $dialog.find('div[name="save_reset_message"]').text('Config file reseted succesfully');
                        // TODO: Add this action into a confirm dialog
                        _window.dialogConfirm(
                            {
                                ok: 'Restart now',
                                cancel: 'Restart later...',
                                title: 'Apply changes',
                                content: 'You have to restart CodeMaster to apply changes. Do you want to retart now?'
                            },
                            function(choice) {
                                if (choice) {
                                    _application.restart(instance);
                                }
                            }
                        );
                    }
                    else {
                        $dialog.find('div[name="save_reset_message"]').text('Config file can\'t be reseted');
                    }
                });

                if ($dialog.css('display') == 'none') {
                    _window.get().find('div.flatos_codemaster_dialog').hide();
                    $dialog.find('input[name="line"]').val('');
                    $dialog.show();
                    $dialog.find('input[name="line"]').focus();
                    $dialog.keydown(function( event ) {
                        if ( event.keyCode == 27 ) {
                            $dialog.hide();
                            $dialog.unbind('keydown');
                            editor.focus();
                        }
                    });
                }
                else {
                    $dialog.hide();
                    $dialog.find('div[name="save_reset_message"]').text('');
                    $dialog.unbind('keydown');
                    editor.focus();
                }
            },
            readOnly: true
        });

        // Show Infos
        editor[currPanel].commands.addCommand({
            name: 'doc_info',
            bindKey: {win: 'Ctrl-I',  mac: 'Command-I'},
            exec: function(editor) {
                var $dialog = _window.get().find('div.doc_info_dialog');

                $dialog.find('.flatos_codemaster_close_dialog').unbind('click').click(function() {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                });

                $dialog.find('fieldset[name="filename"]').children('legend').html(file_info[currPanel].name);
                $dialog.find('p[name="file_path"]').html('<b>File Path:</b> ' + file_info[currPanel].path);
                $dialog.find('p[name="file_size"]').html('<b>File Size:</b> ' + file_info[currPanel].size);
                $dialog.find('p[name="file_type"]').html('<b>File Type:</b> ' + file_info[currPanel].type);
                $dialog.find('p[name="lines_nb"]').html('<b>Number of Lines:</b> ' + editor.session.getLength());

                if ($dialog.css('display') == 'none') {
                    _window.get().find('div.flatos_codemaster_dialog').hide();
                    $dialog.find('input[name="line"]').val('');
                    $dialog.show();
                    $dialog.find('input[name="line"]').focus();
                    $dialog.keydown(function( event ) {
                        if ( event.keyCode == 27 ) {
                            $dialog.hide();
                            $dialog.unbind('keydown');
                            editor.focus();
                        }
                    });
                }
                else {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                }
            },
            readOnly: true
        });

        // Go to
        editor[currPanel].commands.addCommand({
            name: 'go_to_line',
            bindKey: {win: 'Ctrl-G',  mac: 'Command-G'},
            exec: function(editor) {
                var $dialog = _window.get().find('div.go_to_line_dialog');

                $dialog.find('.flatos_codemaster_close_dialog').unbind('click').click(function() {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                });
                $dialog.find('form').submit(function(e) {
                    e.preventDefault();
                    var line = $dialog.find('input[name="line"]').val();
                    if (line) {
                        editor.gotoLine(line);
                    }
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                });

                if ($dialog.css('display') == 'none') {
                    _window.get().find('div.flatos_codemaster_dialog').hide();
                    $dialog.find('input[name="line"]').val('');
                    $dialog.show();
                    $dialog.find('input[name="line"]').focus();
                    $dialog.keydown(function( event ) {
                        if ( event.keyCode == 27 ) {
                            $dialog.hide();
                            $dialog.unbind('keydown');
                            editor.focus();
                        }
                    });
                }
                else {
                    $dialog.hide();
                    $dialog.unbind('keydown');
                    editor.focus();
                }

            },
            readOnly: false
        });

        // App info
        editor[currPanel].commands.addCommand({
            name: 'app_info',
            bindKey: {win: 'F1', mac: 'F1'},
            exec: function(editor) {
                _window.about();
            },
            readOnly: true
        });

        editor[currPanel].setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });

        editor[currPanel].focus();
    }

    var set_panel_title = function(panel_id, panel_title) {
        if (typeof panel_title !== 'undefined') {
            _window.get().find('span#flatos_codemaster_editor_panel_'+panel_id).html(panel_title);
        }
    };

    var set_panel = function(panel_id, path) {
        if (typeof path !== 'undefined') {
            current = parseInt(panel_id.substring(panel_id.lastIndexOf('_')+1));
            var file = new FlatOS.System.FS();
            file_info[current] = {};
            file_info[current].internalPath = path;
            file_info[current].type = file.extension(path);
            file_info[current].path = file.toExternalPath(path);
            file_info[current].name = file.filename(path);
            file_info[current].size = file.sizeInOctets(path);

            set_panel_title(current, file_info[current].name+'.'+file_info[current].type);

            editor[current].setValue(file.read(path));
            _window.setTitle(file_info[current].path + ' - CodeMaster');
            editor[current].getSession().setUndoManager(new ace.UndoManager());
            if (typeof exts[file_info[current].type] === 'undefined') {
                editor[current].getSession().setMode("ace/mode/text");
            }
            else {
                editor[current].getSession().setMode("ace/mode/"+exts[file_info[current].type]);
            }
            editor[current].focus();

            update_panels('#flatos_codemaster_'+instance+'_panel_'+current);
        }
    };

    var openFile = function(path) {
        current = panelNB + 1;
        if (typeof path === 'undefined') {
            var opts = {parent_pid: 'flatos_codemaster', parent_iid: instance};
            var currentUsed = false;
            if (typeof file_info[current-1].internalPath != 'undefined') {
                var file = new FlatOS.System.FS();
                opts.startAt = file.dirname(file_info[current-1].internalPath);
                currentUsed = true;
            }
            var selector = new FlatOS.System.Application.FileSelectorDialog(opts, function (filepath) {
                if (currentUsed) {
                    var file = new FlatOS.System.FS();
                    file_info[current] = {};
                    file_info[current].internalPath = filepath;
                    file_info[current].type = file.extension(filepath);
                    file_info[current].path = file.toExternalPath(filepath);
                    file_info[current].name = file.filename(filepath);
                    file_info[current].size = file.sizeInOctets(filepath);

                    add_panel(file_info[current].name+'.'+file_info[current].type);

                    editor[current].setValue(file.read(filepath));
                    _window.setTitle(file_info[current].path + ' - CodeMaster');
                    editor[current].getSession().setUndoManager(new ace.UndoManager());
                    if (typeof exts[file_info[current].type] === 'undefined') {
                        editor[current].getSession().setMode("ace/mode/text");
                    }
                    else {
                        editor[current].getSession().setMode("ace/mode/"+exts[file_info[current].type]);
                    }
                    editor[current].focus();
                    update_panels('#flatos_codemaster_'+instance+'_panel_'+current);
                    editor[current].execCommand('save');
                }
                else {
                    set_panel(_window.get().find('a.panel-switcher.active').attr('href'), filepath);
                    editor[currPanel].execCommand('save');
                }
            });
        }
        else {
            var file = new FlatOS.System.FS();
            file_info[current] = {};
            file_info[current].internalPath = path;
            file_info[current].type = file.extension(path);
            file_info[current].path = file.toExternalPath(path);
            file_info[current].name = file.filename(path);
            file_info[current].size = file.sizeInOctets(path);

            add_panel(file_info[current].name+'.'+file_info[current].type);

            editor[current].setValue(file.read(path));
            _window.setTitle(file_info[current].path + ' - CodeMaster');
            editor[current].getSession().setUndoManager(new ace.UndoManager());
            if (typeof exts[file_info[current].type] === 'undefined') {
                editor[current].getSession().setMode("ace/mode/text");
            }
            else {
                editor[current].getSession().setMode("ace/mode/"+exts[file_info[current].type]);
            }
            editor[current].focus();
            update_panels('#flatos_codemaster_'+instance+'_panel_'+current);
            editor[current].execCommand('save');
        }
    };

    var fileIsSaved = function(panel) {
        var isSaved = true,
            $panels = _window.get().find('.panel-switcher');

        if (typeof panel === 'undefined') {
            $panels.each(function() {
                if ($(this).children('span').children('b').children().is('.not_saved')) {
                    isSaved = false;
                }
            });
        }
        else {
            if ($(panel).children('span').children('b').children().is('.not_saved')) {
                isSaved = false;
            }
        }

        return isSaved;
    };

    var saveClose = function() {
        if (!fileIsSaved()) {
            _window.dialogConfirm({ title: 'The file isn\'t saved', ok: 'Close', cancel: 'Don\'t close', content: 'The current file is not saved. Do you really want to close CodeMaster?'}, function(choice) {
                if (choice) {
                    _window.close();
                }
            });
        }
        else {
            _window.close();
        }
    };

    ace.require("ace/ext/language_tools");
    ace.require("ace/ext/whitespace");

    var editor = [];

//    _window.get().find('.flatos_codemaster_editor_tools').append($(_icons.getIcon('new-file', 'flatos_codemaster_icon')).click(function() {
//        add_panel();
//    }));
//    _window.get().find('.flatos_codemaster_editor_tools').append($(_icons.getIcon('open-file', 'flatos_codemaster_icon')).click(function() {
//        editor[currPanel].execCommand('open');
//    }));
//    _window.get().find('.flatos_codemaster_editor_tools').append($(_icons.getIcon('save', 'flatos_codemaster_icon')).click(function() {
//        editor[currPanel].execCommand('save');
//    }));
//    _window.get().find('.flatos_codemaster_editor_tools').append($(_icons.getIcon('find-code', 'flatos_codemaster_icon')).click(function() {
//        editor[currPanel].execCommand('find_and_replace');
//    }));
//    _window.get().find('.flatos_codemaster_editor_tools').append($(_icons.getIcon('bug', 'flatos_codemaster_icon')).click(function() {
//        editor[currPanel].execCommand('goToNextError');
//    }));

    _window.on('init', function () {
        add_panel();
        init_panels();

        _window.overwrite('close', function() {
            saveClose();
        });
    });

    _window.on('resizeBegin', function() { editor[currPanel].resize(true) });
    _window.on('resizing', function() { editor[currPanel].resize(true) });
    _window.on('resizeEnd', function() { editor[currPanel].resize(true); editor[currPanel].focus(); });
    _window.on('maximize', function() { editor[currPanel].resize(true); editor[currPanel].focus(); });
    _window.on('focus', function() { editor[currPanel].focus() });

    _window.on('close', function () {
        for (var i = 1; i < panelNB; i++) {
            editor[i].destroy();
        }
    });

    _window.setMenuAction('new', function() { editor[currPanel].execCommand('new') });
    _window.setMenuAction('open', function() { editor[currPanel].execCommand('open') });
    _window.setMenuAction('save', function() { editor[currPanel].execCommand('save') });
    _window.setMenuAction('save_as', function() { editor[currPanel].execCommand('save_as') });
    _window.setMenuAction('quit', function() { saveClose() });
    _window.setMenuAction('undo', function() { editor[currPanel].undo() });
    _window.setMenuAction('redo', function() { editor[currPanel].redo() });
    _window.setMenuAction('select_all', function() { editor[currPanel].selectAll() });
    _window.setMenuAction('clean_doc', function() { editor[currPanel].setValue('') });
    $(langs).each(function() {
        var lang = this;
        _window.setMenuAction(lang, function() { editor[currPanel].getSession().setMode("ace/mode/"+lang); });
    });
    _window.setMenuAction('wrap_mode', function() { editor[currPanel].getSession().setUseWrapMode( !(editor[currPanel].getSession().getUseWrapMode()) ); });
    _window.setMenuAction('read_only', function() { editor[currPanel].setReadOnly( !(editor[currPanel].getReadOnly()) ) });
    _window.setMenuAction('find', function() { editor[currPanel].execCommand('find') });
    _window.setMenuAction('replace', function() { editor[currPanel].execCommand('find_and_replace') });
    _window.setMenuAction('find_next', function() { editor[currPanel].findNext() });
    _window.setMenuAction('find_prev', function() { editor[currPanel].findPrevious() });
    _window.setMenuAction('go_to', function() { editor[currPanel].execCommand('go_to_line') });
    _window.setMenuAction('fold', function() { editor[currPanel].execCommand('fold') });
    _window.setMenuAction('unfold', function() { editor[currPanel].execCommand('unfold') });
    _window.setMenuAction('fold_other', function() { editor[currPanel].execCommand('foldOther') });
    _window.setMenuAction('unfold_all', function() { editor[currPanel].execCommand('unfoldall') });
    _window.setMenuAction('go_to_next_err', function() { editor[currPanel].execCommand('goToNextError') });
    _window.setMenuAction('go_to_prev_err', function() { editor[currPanel].execCommand('goToPreviousError') });
    _window.setMenuAction('comment_lines', function() { editor[currPanel].toggleCommentLines() });
    _window.setMenuAction('lower_case', function() { editor[currPanel].toLowerCase() });
    _window.setMenuAction('upper_case', function() { editor[currPanel].toUpperCase() });
    _window.setMenuAction('preferences', function() { editor[currPanel].execCommand('showSettingsMenu') });
    _window.setMenuAction('about_app', function() { editor[currPanel].execCommand('app_info') });
    _window.setMenuAction('about_doc', function() { editor[currPanel].execCommand('doc_info') });

    _application.registerCommand('open', openFile);

    _application.setContextMenuAction('edit_file', openFile);

})(jQuery);
