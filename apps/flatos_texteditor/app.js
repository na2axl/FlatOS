(function ($) {

    THIS_PROCESS_NAME = 'flatos_texteditor';

    var _a = new FlatOS.Application(THIS_PROCESS_NAME)
        , _w = new FlatOS.Window(THIS_PROCESS_NAME)
        , _f = new FlatOS.System.FS()
        , _k = new FlatOS.Input.Keyboard();

    var instance = _w.getInstanceID();

    var file_info = {};

    var $_w = _w.get()
        , editor = $_w.find('.textEditWidget');

    var openFile = function(path) {
        if (typeof path === 'undefined') {
            var opts = {parent_pid: THIS_PROCESS_NAME, parent_iid: instance};
            var selector = new FlatOS.System.Application.FileSelectorDialog(opts, function (filepath) {
                file_info.internalPath = _f.toInternalPath(filepath);
                file_info.type = _f.extension(filepath);
                file_info.path = _f.toExternalPath(filepath);
                file_info.name = _f.filename(filepath);
                file_info.size = _f.sizeInOctets(filepath);

                editor.text(_f.read(filepath));

                _w.setTitle(file_info.path + ' - Text Editor');

                editor.focus();
            });
        }
        else {
            file_info.internalPath = _f.toInternalPath(path);
            file_info.type = _f.extension(path);
            file_info.path = _f.toExternalPath(path);
            file_info.name = _f.filename(path);
            file_info.size = _f.sizeInOctets(path);

            editor.text(_f.read(path));

            _w.setTitle(file_info.path + ' - Text Editor');

            editor.focus();
        }
    };

    var saveFile = function () {
        if (typeof file_info.internalPath !== 'undefined') {
            isSaved = _f.write(file_info.internalPath, editor.val());
            if (isSaved === true) {
                _w.setTitle(file_info.path + ' - Text Editor');
                _AddOnEditEvent();
            }
            else {
                _w.dialogAlert({
                    parent_pid: THIS_PROCESS_NAME,
                    parent_iid: instance,
                    title: "Can't save the file",
                    content: "A problem occur when saving the file. Please try again later."
                });
            }
            editor.focus();
        }
        else {
            saveFileAs();
        }
    };

    var saveFileAs = function () {
        var opts = {
            parent_pid: THIS_PROCESS_NAME,
            parent_iid: instance,
            contents: editor.text(),
            withExt: ['txt'],
            ext: 'txt'
        };
        if (typeof file_info.internalPath !== 'undefined') {
            var file = new FlatOS.System.FS();
            opts.startAt = file.dirname(file_info.internalPath);
        }
        var selector = new FlatOS.System.Application.FileSaverDialog(opts, function(isSaved, path) {
            if (isSaved === true) {
                openFile(path);
                _w.setTitle(file_info.path + ' - Text Editor');
                _AddOnEditEvent();
            }
            else {
                _w.dialogAlert({
                    parent_pid: THIS_PROCESS_NAME,
                    parent_iid: instance,
                    title: "Can't save the file",
                    content: "A problem occur when saving the file. Please try again later."
                });
            }
            editor.focus();
        });
    };

    var _AddOnEditEvent = function () {
        _k.keyDown('texteditor.text.change', editor, function (e) {
            if (e.keyCode >= 65 && e.keyCode <= 90) {
                _w.setTitle('[*] ' + _w.getTitle());
                _k.unbindKeyDown('texteditor.text.change', editor);
            }
        });
    };

    _w.on('init', function () {
        _AddOnEditEvent();
        _w.addShortcut('Ctrl+S', function () {
            saveFile();
        });
    });

    _w.on('focus', function () {
        editor.focus();
    });

    _a.registerCommand('open', openFile);

})(jQuery);