(function ($) {

    const this_process_name = 'flatos_docwriter';

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

    var page_contents_element = null;

    var autosave_interval = 0;

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

    var update_page_margin = function () {
        var page = $('.docwriter_document_page');
        var left = (_w.width() / 2) - (page.outerWidth() / 2);
        $('.docwriter_document_page').css('margin-left', (left < 0 ? 0 : left));
    };

    var init_docwriter = function () {
        $_w.find('.toolbox_ribbon').addClass('hide');

        ContentTools.RESTRICTED_ATTRIBUTES = {
            '*': ['class']
            , 'img': ['height', 'src', 'width', 'data-ce-max-width', 'data-ce-min-width']
            , 'iframe': ['height', 'width']
        };

        ContentTools.StylePalette.add([
            new ContentTools.Style('Bordered', 'img-bordered', ['img']),

            new ContentTools.Style('No Border', 'table-noborder', ['table']),
            new ContentTools.Style('External Border Only', 'table-externalborder', ['table']),
            new ContentTools.Style('Internal Border Only', 'table-internalborder', ['table']),

            new ContentTools.Style('Decimal Bullets', 'list-style-type-decimal', ['ol']),
            new ContentTools.Style('Decimal Bullets Starting With Zero', 'list-style-type-decimal-leading-zero', ['ol']),
            new ContentTools.Style('Lower Roman Bullets', 'list-style-type-lower-roman', ['ol']),
            new ContentTools.Style('Upper Roman Bullets', 'list-style-type-upper-roman', ['ol']),
            new ContentTools.Style('Lower Alpha Bullets', 'list-style-type-lower-alpha', ['ol']),
            new ContentTools.Style('Upper Alpha Bullets', 'list-style-type-upper-alpha', ['ol']),
            new ContentTools.Style('Disc Bullets', 'list-style-type-disc', ['ul']),
            new ContentTools.Style('Circle Bullets', 'list-style-type-circle', ['ul']),
            new ContentTools.Style('Square Bullets', 'list-style-type-square', ['ul']),
            new ContentTools.Style('No Bullets', 'list-style-type-none', ['ol', 'ul'])
        ]);
    };

    var add_page = function () {
        $_w.find('.docwriter_pages').append('<div class="docwriter_document_page"><div class="docwriter_document_page_content" data-editable data-name="docwriter_document"><p></p></div></div>');

        page_contents_element = $_w.find('.docwriter_document_page_content').eq(0)[0];
        var ct_app = $_w.find('.ct-app');

        editor = ContentTools.EditorApp.get();

        editor.mount(ct_app[0]);
        editor.init('*[data-editable]', 'data-name');

        inspector = editor.inspector();

        if (!editor.isEditing()) {
            editor.start();
        }

        ct_app.appendTo($_w.find('.docwriter_pages_wrapper'));
        ct_app.children('.ct-ignition').remove();
        // ct_app.children('.ct-inspector').remove();
        ct_app.children('.ct-toolbox').remove();
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
            _m.leftClick('docwriter.panel.switch', $a, function (e) {
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

    var get_page_contents = function get_page_contents() {
        return editor.history.snapshot();
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
                file_info.internalPath = _f.toInternalPath(filepath);
                file_info.path = _f.toExternalPath(filepath);
                file_info.name = _f.filename(filepath);
                var doc = JSON.parse(_f.read(filepath));
                for (var side in doc.doc_properties.page_margin) {
                    set_page_margin(side, doc.doc_properties.page_margin[side]);
                }
                set_page_contents(doc.doc_contents);
            });
        }
        else {
            file_info.internalPath = _f.toInternalPath(path);
            file_info.path = _f.toExternalPath(path);
            file_info.name = _f.filename(path);
            var doc = JSON.parse(_f.read(path));
            for (var side in doc.doc_properties.page_margin) {
                set_page_margin(side, doc.doc_properties.page_margin[side]);
            }
            set_page_contents(doc.doc_contents);
        }
    };

    var save_document = function save_document() {
        if (typeof file_info.internalPath === 'undefined') {
            var opts = {
                startAt: _u.userDir('Documents')
                , parent_pid: this_process_name
                , parent_iid: instance
                , withExt: ['docw']
                , contents: JSON.stringify(get_document())
                , ext: 'docw'
            };
            new FlatOS.System.Application.FileSaverDialog(opts, function (isSaved, path) {
                if (isSaved) {
                    flashUI = new ContentTools.FlashUI('ok');
                    open_document(path);
                }
                else {
                    flashUI = new ContentTools.FlashUI('no');
                }
            });
        }
        else {
            var isSaved = _f.write(file_info.internalPath, JSON.stringify(get_document()));
            if (isSaved) {
                flashUI = new ContentTools.FlashUI('ok');
            }
            else {
                flashUI = new ContentTools.FlashUI('no');
            }
        }
    }

    var get_document = function () {
        return {
            doc_properties: get_page_properties(),
            doc_contents: get_page_contents()
        };
    };

    var init_autosave = function (interval) {
        autosave_interval = setInterval(function () {
            console.log(editor.history.snapshot());
            console.log(editor.regions());
        }, interval);
    };

    var update_tool = function (tool) {
        var element, selection;
        element = ContentEdit.Root.get().focused();
        if (!(element && element.isMounted())) {
            return false;
        }
        selection = null;
        if (element && element.selection) {
            selection = element.selection();
        }
        if (typeof tool === 'undefined') {
            for (var tool in tools) {
                if (tool != 'updateInterval') {
                    update_tool(tool);
                }
            }
        } else {
            if (ContentTools.ToolShelf.fetch(tool).isApplied(element, selection)) {
                $_w.find('.action-' + tool).addClass('applied');
            } else {
                $_w.find('.action-' + tool).removeClass('applied');
            }
        }
    };

    var update_toolbox_ribbon = function () {
        var element = ContentEdit.Root.get().focused();
        if (!(element && element.isMounted())) {
            return false;
        }
        var type = element.type();
        $_w.find('li[data-toolbox-ribbon]').addClass('hide');
        if ($_w.find('li[data-toolbox-ribbon='+type+']').length > 0) {
            $_w.find('li[data-toolbox-ribbon='+type+']').removeClass('hide');
        }
    }

    _w.on('init', function () {
        init_docwriter();

        add_page();

        var $wrapper = $_w.find(".panels")
            , $parent = $wrapper.parent('.panel-wrapper')
            , $panels = $wrapper.find('.panel')
            , $buttons = $parent.find('.panel-switcher');

        $buttons.each(function () {
            $(this).attr('href', $(this).attr('href') + instance);
        });
        $panels.each(function () {
            $(this).attr('id', $(this).attr('id') + instance);
        });

        init_panels();

        var page = $_w.find('.docwriter_document_page_content')[0]
            , container = $_w[0];

        $(['undo', 'redo']).each(function () {
            var action = this;
            _m.leftClick('docwriter.stack.'+action, $_w.find('.action-'+action), function () {
                var element, selection;
                element = ContentEdit.Root.get().focused();
                if (!(element && element.isMounted())) {
                    return false;
                }
                selection = null;
                if (element && element.selection) {
                    selection = element.selection();
                }
                ContentTools.ToolShelf.fetch(action).apply(element, selection, function (success) {});
            })
        });

        $(['unordered-list', 'ordered-list']).each(function () {
            var el = this;
            _m.buttonDown('docwriter.show.dropdown', $_w.find('.dropdown-' + el), function () {
                var $el = $_w.find('.action-' + el);
                var el_offset = $el.offset();
                el_offset.top += $el.height();
                el_offset.left += $el.width();
                $_w.find('.docwriter_dropdown').hide(0);
                $_w.find('.docwriter_dropdown_' + el)
                    .show(0)
                    .offset(el_offset);
            });
            _m.buttonUp('docwriter.show.dropdown', $_w.find('.dropdown-' + el), function () {
                _m.buttonDownOnce('docwriter.hide.dropdown', $(document), function () {
                    $_w.find('.docwriter_dropdown_' + el).hide(0);
                });
            });
        });

        $(['bold', 'italic', 'underline', 'strike', 'superscript', 'subscript', 'align-left'
           , 'align-center', 'align-right', 'align-justify', 'indent', 'unindent', 'paragraph', 'heading'
           , 'subheading', 'preformatted', 'blockquote', 'unordered-list', 'ordered-list']).each(function () {
            var action = this;

            tools[action] = new ContentTools.ToolUI(ContentTools.ToolShelf.fetch(action));

            _m.leftClick('docwriter.text.modifier', $_w.find('.action-' + action), function () {
                var element, selection;
                element = ContentEdit.Root.get().focused();
                if (!(element && element.isMounted())) {
                    return false;
                }
                selection = null;
                if (element && element.selection) {
                    selection = element.selection();
                }
                tools[action].apply(element, selection);
            });
        });

        _m.leftClick('docwriter.text.modifier', $_w.find('.action-unformat'), function () {
                var element, selection;
                element = ContentEdit.Root.get().focused();
                if (!(element && element.isMounted())) {
                    return false;
                }
                selection = null;
                if (element && element.selection) {
                    selection = element.selection();
                }
                new ContentTools.ToolUI(ContentTools.ToolShelf.fetch('unformat')).apply(element, selection);
        });

        _m.leftClick('docwriter.text.size', $_w.find('.action-size_up'), function () {
            var element, selection;
            element = ContentEdit.Root.get().focused();
            if (!(element && element.isMounted())) {
                return false;
            }
            selection = null;
            if (element && element.selection) {
                selection = element.selection();
            }
            ContentTools.ToolShelf.fetch('fontsizeup').apply(element, selection, function (success) {});
            // var el = editor.getSelectedParentElement();

            // if (el.nodeName.toLowerCase() === 'font' && $(el).hasClass('font-size')) {
            //     var size = parseInt($(el).css('font-size')) + 2;
            //     $(el).attr('style', 'font-size:' + size + 'px');
            // }
            // else {
            //     var font_s = parseInt($(page).css('font-size')) + 2;
            //     editor.execAction('fontSize', { value: font_s });
            //     var parent = editor.getSelectedParentElement();
            //     $(parent)
            //         .addClass('font-size')
            //         .removeAttr('size')
            //         .attr('style', 'font-size:' + font_s + 'px');
            // }
        });

        _m.leftClick('docwriter.text.size', $_w.find('.action-size_down'), function () {
            var element, selection;
            element = ContentEdit.Root.get().focused();
            if (!(element && element.isMounted())) {
                return false;
            }
            selection = null;
            if (element && element.selection) {
                selection = element.selection();
            }
            ContentTools.ToolShelf.fetch('fontsizedown').apply(element, selection, function (success) {});
            // var el = editor.getSelectedParentElement();

            // if (el.nodeName.toLowerCase() === 'font' && $(el).hasClass('font-size')) {
            //     var size = parseInt($(el).css('font-size')) - 2;
            //     size = (size > 8) ? size : 8;
            //     $(el).attr('style', 'font-size:' + size + 'px');
            // }
            // else {
            //     var font_s = parseInt($(page).css('font-size')) - 2;
            //     font_s = (font_s > 8) ? font_s : 8;
            //     editor.execAction('fontSize', { value: font_s });
            //     var parent = editor.getSelectedParentElement();
            //     $(parent)
            //         .addClass('font-size')
            //         .removeAttr('size')
            //         .attr('style', 'font-size:' + font_s + 'px');
            // }
        });

        _m.leftClick('docwriter.insert.image', $_w.find('.action-insert_image'), function () {
            var element, selection;
            element = ContentEdit.Root.get().focused();

            var opts = {
                startAt: _u.userDir('Pictures')
                , parent_pid: this_process_name
                , parent_iid: instance
                , withExt: ['jpg', 'bmp', 'gif', 'png']
            };
            new FlatOS.System.Application.FileSelectorDialog(opts, function (path) {
                var image = new Image();
                var canvas = $_w.find('canvas.docwriter_insert_image_support')[0];
                var context = canvas.getContext('2d');

                context.save();

                imageDialog = new ContentTools.ImageDialog();
                modal = new ContentTools.ModalUI();

                editor.attach(modal);
                editor.attach(imageDialog);

                imageDialog.addEventListener('cancel', (function () {
                    return function () {
                        modal.hide();
                        imageDialog.hide();
                        return false;
                    };
                })());

                imageDialog.mount();

                imageDialog.addEventListener('imageuploader.clear', (function () {
                    return function () {
                        modal.hide();
                        imageDialog.hide();
                        new FlatOS.System.Application.ConfirmDialog({
                            parent_pid: this_process_name
                            , parent_iid: instance
                            , title: 'Choose another picture ?'
                            , content: 'Do you want to choose another picture ?'
                            , ok: 'Yes'
                            , cancel: 'No, just close this popup'
                        }, function (choice) {
                            if (choice) {
                                $_w.find('.action-insert_image').trigger('click.docwriter.insert.image');
                            }
                        });
                    }
                })());

                image.onload = function () {
                    canvas.height = image.height;
                    canvas.width = image.width;
                    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
                    var url = canvas.toDataURL('image/png');

                    imageDialog.populate(url, [image.width, image.height]);

                    imageDialog.addEventListener('imageuploader.rotatecw', (function () {
                        return function () {
                            var ctx = new Image();

                            ctx.onload = function () {
                                canvas.height = ctx.width;
                                canvas.width = ctx.height;

                                context.restore();
                                context.translate(canvas.width, 0);
                                context.rotate((Math.PI / 180) * 90);
                                context.drawImage(ctx, 0, 0);

                                var temp = new Image();
                                temp.onload = function () {
                                    imageDialog.populate(temp.src, [temp.width, temp.height]);
                                };

                                temp.src = canvas.toDataURL('image/png');
                            };

                            ctx.src = canvas.toDataURL('image/png');
                        };
                    })());

                    imageDialog.addEventListener('imageuploader.rotateccw', (function () {
                        return function () {
                            var ctx = new Image();

                            ctx.onload = function () {
                                canvas.height = ctx.width;
                                canvas.width = ctx.height;

                                context.restore();
                                context.translate(0, canvas.height);
                                context.rotate((Math.PI / 180) * -90);
                                context.drawImage(ctx, 0, 0);

                                var temp = new Image();
                                temp.onload = function () {
                                    imageDialog.populate(temp.src, [temp.width, temp.height]);
                                };

                                temp.src = canvas.toDataURL('image/png');
                            };

                            ctx.src = canvas.toDataURL('image/png');
                        };
                    })());

                    imageDialog.addEventListener('imageuploader.flipvertical', (function () {
                        return function () {
                            var ctx = new Image();

                            ctx.onload = function () {
                                canvas.height = ctx.height;
                                canvas.width = ctx.width;

                                context.restore();
                                context.scale(-1, 1);
                                context.translate(-canvas.width, 0);
                                context.drawImage(ctx, 0, 0);

                                var temp = new Image();
                                temp.onload = function () {
                                    imageDialog.populate(temp.src, [temp.width, temp.height]);
                                };

                                temp.src = canvas.toDataURL('image/png');
                            };

                            ctx.src = canvas.toDataURL('image/png');
                        };
                    })());

                    imageDialog.addEventListener('imageuploader.fliphorizontal', (function () {
                        return function () {
                            var ctx = new Image();

                            ctx.onload = function () {
                                canvas.height = ctx.height;
                                canvas.width = ctx.width;

                                context.restore();
                                context.scale(1, -1);
                                context.translate(0, -canvas.height);
                                context.drawImage(ctx, 0, 0);

                                var temp = new Image();
                                temp.onload = function () {
                                    imageDialog.populate(temp.src, [temp.width, temp.height]);
                                };

                                temp.src = canvas.toDataURL('image/png');
                            };

                            ctx.src = canvas.toDataURL('image/png');
                        };
                    })());

                    imageDialog.addEventListener('imageuploader.save', (function (_this) {
                        return function () {
                            var ctx = new Image()

                            ctx.onload = function () {
                                var crop_region = imageDialog.cropRegion();

                                var sX = crop_region[1] * ctx.width;
                                var sY = crop_region[0] * ctx.height;
                                var sW = (crop_region[3] - crop_region[1]) * ctx.width;
                                var sH = (crop_region[2] - crop_region[0]) * ctx.height;

                                context.restore();
                                canvas.height = sH;
                                canvas.width = sW;
                                context.drawImage(ctx, sX, sY, sW, sH, 0, 0, sW, sH);

                                var img
                                    , imageAttrs = {}
                                    , index, node, _ref;

                                imageAttrs.height = sH;
                                imageAttrs.src = canvas.toDataURL('image/png');;
                                imageAttrs.width = sW;
                                imageAttrs['data-ce-max-width '] = $(page_contents_element).width();

                                img = new ContentEdit.Image(imageAttrs);
                                _ref = _this._insertAt(element), node = _ref[0], index = _ref[1];

                                node.parent().attach(img, index);
                                img.focus();

                                modal.hide();
                                imageDialog.hide();
                            };

                            ctx.src = canvas.toDataURL('image/png');

                            return true;
                        };
                    })(ContentTools.Tool));

                    modal.show();
                    imageDialog.show();
                };

                image.src = _f.toFilesystemPath(path);
            });
        });

        _m.leftClick('docwriter.insert.table', $_w.find('.action-insert_table'), function () {
            var _adjustColumns = function (section, columns) {
                var cell, cellTag, cellText, currentColumns, diff, i, row, _i, _len, _ref, _results;
                _ref = section.children;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    row = _ref[_i];
                    cellTag = row.children[0].tagName();
                    currentColumns = row.children.length;
                    diff = columns - currentColumns;
                    if (diff < 0) {
                        _results.push((function () {
                            var _j, _results1;
                            _results1 = [];
                            for (i = _j = diff; diff <= 0 ? _j < 0 : _j > 0; i = diff <= 0 ? ++_j : --_j) {
                                cell = row.children[row.children.length - 1];
                                _results1.push(row.detach(cell));
                            }
                            return _results1;
                        })());
                    }
                    else if (diff > 0) {
                        _results.push((function () {
                            var _j, _results1;
                            _results1 = [];
                            for (i = _j = 0; 0 <= diff ? _j < diff : _j > diff; i = 0 <= diff ? ++_j : --_j) {
                                cell = new ContentEdit.TableCell(cellTag);
                                row.attach(cell);
                                cellText = new ContentEdit.TableCellText('');
                                _results1.push(cell.attach(cellText));
                            }
                            return _results1;
                        })());
                    }
                    else {
                        _results.push(void 0);
                    }
                }
                return _results;
            };

            var _createTable = function (tableCfg) {
                var body, foot, head, table;
                table = new ContentEdit.Table();
                if (tableCfg.head) {
                    head = _createTableSection('thead', 'th', tableCfg.columns);
                    table.attach(head);
                }
                body = _createTableSection('tbody', 'td', tableCfg.columns);
                table.attach(body);
                if (tableCfg.foot) {
                    foot = _createTableSection('tfoot', 'td', tableCfg.columns);
                    table.attach(foot);
                }
                return table;
            };

            var _createTableSection = function (sectionTag, cellTag, columns) {
                var cell, cellText, i, row, section, _i;
                section = new ContentEdit.TableSection(sectionTag);
                row = new ContentEdit.TableRow();
                section.attach(row);
                for (i = _i = 0; 0 <= columns ? _i < columns : _i > columns; i = 0 <= columns ? ++_i : --_i) {
                    cell = new ContentEdit.TableCell(cellTag);
                    row.attach(cell);
                    cellText = new ContentEdit.TableCellText('');
                    cell.attach(cellText);
                }
                return section;
            };

            var _updateTable = function (tableCfg, table) {
                var columns, foot, head, section, _i, _len, _ref;
                if (!tableCfg.head && table.thead()) {
                    table.detach(table.thead());
                }
                if (!tableCfg.foot && table.tfoot()) {
                    table.detach(table.tfoot());
                }
                columns = table.firstSection().children[0].children.length;
                if (tableCfg.columns !== columns) {
                    _ref = table.children;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        section = _ref[_i];
                        _adjustColumns(section, tableCfg.columns);
                    }
                }
                if (tableCfg.head && !table.thead()) {
                    head = _createTableSection('thead', 'th', tableCfg.columns);
                    table.attach(head);
                }
                if (tableCfg.foot && !table.tfoot()) {
                    foot = _createTableSection('tfoot', 'td', tableCfg.columns);
                    return table.attach(foot);
                }
            };

            var element, selection;
            element = ContentEdit.Root.get().focused();
            if (!(element && element.isMounted())) {
                return false;
            }
            selection = null;
            if (element && element.selection) {
                selection = element.selection();
            }

            tableDialog = new ContentTools.TableDialog();
            modal = new ContentTools.ModalUI();

            editor.attach(modal);
            editor.attach(tableDialog);

            tableDialog.addEventListener('cancel', (function () {
                return function () {
                    modal.hide();
                    tableDialog.hide();
                    return false;
                };
            })());

            tableDialog.addEventListener('save', (function (_this) {
                return function (ev) {
                    var index, keepFocus, node, tableCfg, _ref;
                    tableCfg = ev.detail();
                    table = _createTable(tableCfg);
                    _ref = _this._insertAt(element), node = _ref[0], index = _ref[1];
                    node.parent().attach(table, index);
                    p = new ContentEdit.Text('p');
                    node.parent().attach(p, index+1);
                    table.firstSection().children[0].children[0].children[0].focus();
                    modal.hide();
                    tableDialog.hide();
                    return true;
                };
            })(ContentTools.Tool));

            tableDialog.mount();

            tableDialog.show();
            modal.show();
        });

        _m.leftClick('docwriter.insert.video', $_w.find('.action-insert_video'), function () {
            var element, selection;
            element = ContentEdit.Root.get().focused();
            if (!(element && element.isMounted())) {
                return false;
            }
            selection = null;
            if (element && element.selection) {
                selection = element.selection();
            }
            ContentTools.ToolShelf.fetch('video').apply(element, selection, function (success) {});
        });

        _m.leftClick('docwriter.document.save', $_w.find('.action-save'), function () {
            save_document();
        });

        _w.addShortcut('Ctrl+S', function () {

        });

        // init_autosave(5000);

        for (var action in tools) {
            tools[action].addEventListener('applied', (function (_this) {
                return function () {
                    update_tool(_this);
                };
            })(action));
        }

    });

    _w.on('focus', function () {
        // TODO: Focus on the last element
    });

    _w.on('update', function () {
        update_tool();
        update_toolbox_ribbon();
        update_panels_sizes();
        update_page_margin();
    });

    _w.on('close', function () {
        editor.destroy();
        clearInterval(autosave_interval);
    });

    _w.on('resizing', function () {
        update_panels_sizes();
    });

    _a.registerCommand('open', function (path) {
        open_document(path);
        $_w.find('.panel-file').addClass('hide');
    });

})(jQuery);