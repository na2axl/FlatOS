(function ($) {

    const this_process_name = 'flatos_spreedsheeter';

    var _w = new FlatOS.Window(this_process_name)
        , _a = new FlatOS.Application(this_process_name)
        , _m = new FlatOS.Input.Mouse()
        , _u = new FlatOS.System.User()
        , _f = new FlatOS.System.FS();


    var instance = _w.getInstanceID()
        , $_w = _w.get();

    var current_page;

    var file_info = {}
        , currPanel = 0
        , prevpanel;

    var editor
        , stack
        , range
        , inspector
        , tools = {}
        , imageDialog
        , tableDialog
        , modal
        , flashUI
        , clipboard;

    var page_contents_element;

    var autosave_interval;

    var update_panels_sizes = function () {
        $_w.find('.panel').each(function() {
            var panel_width = 0;
            $(this).find('.command_group').each(function () {
                panel_width += $(this).outerWidth(true);
            });
            if (panel_width > _w.width()) {
                $(this).width(panel_width);
            }
            else {
                $(this).width('100%');
            }
        });
    };

    var init_spreedsheeter = function () {
    };

    var getParentNode = function (el, until) {
        var target = el.parentNode;
        if (typeof until != 'undefined') {
            if (target && target.tagName != until) {
                return getParentNode(target, until);
            }
        }
        return target;
    };

    var update_panels = function (panel_id) {
        var $wrapper = $_w.find(".panels")
            , $parent = $wrapper.parent('.panel-wrapper')
            , $panels = $wrapper.find('.panel')
            , $buttons = $parent.find('.panel-switcher');

        $buttons.removeClass('active');
        $buttons.filter('[href="' + panel_id + '"]').addClass('active');

        $panels.hide(0, function () {
            $(panel_id).show(0, function () {
                update_panels_sizes();
            });
        });
    };

    var init_panels = function () {

        var $wrapper = $_w.find(".panels")
            , $parent = $wrapper.parent('.panel-wrapper')
            , $panels = $wrapper.find('.panel')
            , $buttons = $parent.find('.panel-switcher');

        var currpanelid = '#' + $panels.eq(currPanel).attr('id');

        if (typeof prevpanel === 'undefined') {
            prevpanel = currpanelid;
        }

        $buttons.each(function () {
            var $a = $(this);
            $a.unbind('click').click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                if ($a.hasClass('disable-switch')) {
                    return false;
                } else {
                    prevpanel = currpanelid;
                    update_panels($a.attr('href'));
                }
            });
        });

        update_panels(currpanelid);

    };

    var set_page_margin = function set_page_margin(side, size) {
        $_w.find('.docwriter_document_page').css('padding-' + side, size);
    };

    var set_page_contents = function set_page_contents(snapshot) {
        editor.revertToSnapshot(snapshot);
    };

    var get_page_margin = function get_page_margin(side) {
        if (typeof side === 'undefined') {
            return {
                top: $_w.find('.docwriter_document_page').css('padding-top')
                , left: $_w.find('.docwriter_document_page').css('padding-left')
                , bottom: $_w.find('.docwriter_document_page').css('padding-bottom')
                , right: $_w.find('.docwriter_document_page').css('padding-right')
            };
        } else {
            return $_w.find('.docwriter_document_page').css('padding-' + side);
        }
    };

    var get_page_properties = function get_page_properties(prop) {
        switch (prop) {
            case 'page_margin':
                return get_page_margin();

            default:
                return {
                    page_margin: get_page_margin()
                }
        }
    };

    var open_document = function open_document(path) {
        if (typeof path === 'undefined') {
            var opts = {
                startAt: _u.userDir('Documents')
                , parent_pid: this_process_name
                , parent_iid: instance
            };
            if (typeof file_info.internalPath != 'undefined') {
                opts.startAt = _f.dirname(file_info.internalPath);
            }
            new FlatOS.System.Application.FileSelectorDialog(opts, function (filepath) {
                file_info.internalPath = filepath;
                file_info.path = _f.toExternalPath(filepath);
                file_info.name = _f.filename(filepath);
                var doc = JSON.parse(_f.read(filepath));
                for (var side in doc.doc_properties.page_margin) {
                    set_page_margin(side, doc.doc_properties.page_margin[side]);
                }
                set_page_contents(doc.doc_contents);
            });
        } else {
            file_info.internalPath = path;
            file_info.path = _f.toExternalPath(path);
            file_info.name = _f.filename(path);
            var doc = JSON.parse(_f.read(path));
            for (var side in doc.doc_properties.page_margin) {
                set_page_margin(side, doc.doc_properties.page_margin[side]);
            }
            set_page_contents(doc.doc_contents);
        }
    };

    var get_document = function () {
        return {
            doc_properties: get_page_properties(),
            doc_contents: 'IMPLEMENT THIS !!'
        };
    };

    var init_autosave = function (interval) {
    };

    var update_tool = function (tool) {
    };

    var update_toolbox_ribbon = function () {
    }

    _w.on('init', function () {
        init_panels();
    });

    _w.on('focus', function () {
        // TODO: Focus on the last element
    });

    _w.on('update', function () {
        update_tool();
        update_toolbox_ribbon();
        update_panels_sizes();
    });

    _w.on('close', function () {
        clearInterval(autosave_interval);
    });

    _w.on('resizing', function () {
        update_panels_sizes();
    });

    _a.registerCommand('open', open_document);

})(jQuery);