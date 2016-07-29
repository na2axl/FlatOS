(function($) {

    const this_process_name = 'flatos_imageviewer';

    var _w = new FlatOS.Window(this_process_name),
        _a = new FlatOS.Application(this_process_name),
        _u = new FlatOS.System.User();

    var file_info = {},
        img_list = [];

    var currentImg = 0 ;

    var $_w = _w.get(),
        instance = _w.getInstanceID();

    $_w.find('#flatos_imageviewer_view').attr('id', 'flatos_imageviewer_view_'+instance);
    $_w.find('#flatos_imageviewer_img').attr('id', 'flatos_imageviewer_img_'+instance);

   var dataURItoBlob = function(dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    };

    var openAnImg = function(image) {
        var file = new FlatOS.File(image);
        file_info.internalPath = image;
        file_info.type = file.extension();
        file_info.path = file.externalPath();
        file_info.fspath = file.fileSystemPath();
        file_info.inpath = file.internalPath();
        file_info.name = file.filename();
        file_info.size = file.sizeInOctets();
        file_info.mime = file.mimetype();
        file_info.folder = file.dirname();
        $_w.find('#flatos_imageviewer_view_'+instance).children('img').attr({
            src: file_info.fspath,
            alt: file_info.name,
            id: '#flatos_imageviewer_img_'+instance
        });
        new Darkroom('#flatos_imageviewer_img_'+instance, {
            plugins: {
                save: {
                    callback: function() {
                        this.darkroom.selfDestroy();
                        var newImage = this.darkroom.canvas.toDataURL({format:file_info.mime});
                        var datas = dataURItoBlob(newImage);
                        var opts = {
                            parent_pid: this_process_name,
                            parent_iid: instance,
                            contents: datas,
                            ext: file_info.type,
                            withExt: [file_info.type]
                        };
                        if (typeof file_info.internalPath !== 'undefined') {
                            var file = new FlatOS.File(file_info.internalPath);
                            opts.startAt = file.dirname();
                        }
                        var selector = new FlatOS.System.FileSaverWindow(opts, function(isSaved, path) { console.log(isSaved); });
                    }
                }
            }
        });
    };

    var loadImgs = function() {
        var folder = new FlatOS.ApiFile(function(list) {
            for (var item in list) {
                if (list[item].type == 'png' || list[item].type == 'jpg' || list[item].type == 'jpeg' || list[item].type == 'bmp' || list[item].type == 'gif') {
                    img_list[currentImg] = list[item].path;
                    currentImg++;
                }
            }
            $_w.find('.flatos_imageviewer_prev span').click(function() {
                currentImg--;
                if (currentImg < 0) {
                    currentImg = img_list.length - 1;
                }
                openAnImg(img_list[currentImg]);
            });
            $_w.find('.flatos_imageviewer_next span').click(function() {
                currentImg++;
                if (currentImg >= img_list.length) {
                    currentImg = 0;
                }
                openAnImg(img_list[currentImg]);
            });
            currentImg = img_list.indexOf(file_info.inpath);
        });
        folder.open(file_info.folder);
    };

    var openImg = function(path) {
        if (typeof path === 'undefined') {
            var opts = {startAt: _u.userDir('Pictures'), parent_pid: this_process_name, parent_iid: instance};
            if (typeof file_info.internalPath != 'undefined') {
                var file = new FlatOS.File(file_info.internalPath);
                opts.startAt = file.dirname();
            }
            var selector = new FlatOS.System.FileSelectorWindow(opts, function(filepath) { openAnImg(filepath) });
        }
        else {
            openAnImg(path);
        }
        loadImgs();
    };

    var zoom_1x = function() {
        $_w.find('#flatos_imageviewer_view_'+instance).children('img').css({
            'width': 'auto',
            'height': 'auto'
        });
    };

    var zoom_15x = function() {
        zoom_1x();
        $_w.find('#flatos_imageviewer_view_'+instance).children('img').css({
            'width': parseInt($_w.find('#flatos_imageviewer_view_'+instance).children('img').outerWidth()) * 1.5
        });
    };

    var zoom_2x = function() {
        zoom_1x();
        $_w.find('#flatos_imageviewer_view_'+instance).children('img').css({
            'width': parseInt($_w.find('#flatos_imageviewer_view_'+instance).children('img').outerWidth()) * 2
        });
    };

    var fit_v = function() {
        $_w.find('#flatos_imageviewer_view_'+instance).children('img').css({
            'width': 'auto',
            'height': '100%'
        });
    };

    var fit_h = function() {
        $_w.find('#flatos_imageviewer_view_'+instance).children('img').css({
            'width': '100%',
            'height': 'auto'
        });
    };

    $_w.find('#flatos_imageviewer_view_'+instance).children('img').mousedown(function(e) {
        e.preventDefault();

        var imgPos = {
            x: -$_w.find('#flatos_imageviewer_view_'+instance).scrollLeft(),
            y: -$_w.find('#flatos_imageviewer_view_'+instance).scrollTop()
        },
        posDiff = {
            x: e.pageX - imgPos.x,
            y: e.pageY - imgPos.y
        };

        $_w.find('#flatos_imageviewer_view_'+instance).addClass('cursor-move');

        $(window).on('mousemove', function(e) {
            e.preventDefault();

            $_w.find('#flatos_imageviewer_view_'+instance)
            .stop()
            .scrollLeft(-(e.pageX - posDiff.x))
            .scrollTop(-(e.pageY - posDiff.y));
        }).one('mouseup', function() {
            $(window).off('mousemove');
            $_w.find('#flatos_imageviewer_view_'+instance).removeClass('cursor-move');
        });
    });

    _w.setMenuAction('open', function() { openImg() });
    _w.setMenuAction('quit', function() { _w.close() });
    _w.setMenuAction('fit_v', function() { fit_v() });
    _w.setMenuAction('fit_h', function() { fit_h() });
    _w.setMenuAction('zoom_100', function() { zoom_1x() });
    _w.setMenuAction('zoom_150', function() { zoom_15x() });
    _w.setMenuAction('zoom_200', function() { zoom_2x() });
    _w.setMenuAction('about_app', function() { new FlatOS.System.AboutAppWindow(this_process_name) });

    _a.registerCommand('open', openImg);

})(jQuery);