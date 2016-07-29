(function() {

    const this_process_name = 'flatos_webplayer';
    const view_by_album = 0;
    const view_by_artist = 1;
    const view_by_raw = 2;

    var _c = $('.flatos_webplayer_container');

    var _w = new FlatOS.Window(this_process_name),
        _t = new FlatOS.Taskbar(this_process_name),
        _a = new FlatOS.Application(this_process_name),
        _u = new FlatOS.User();

    var config = _a.loadConfigFile(),
        instance = _w.getInstanceID(),
        $_w = _w.get();

    var library_items = config.libraryItems;

    var file_info = {},
        playlist = [];

    var jsmediatags = window.jsmediatags;

    var currentMedia = mediaNB = 0;

    var inPlaylist = false;

    var api = null;

    var clear_playlist = function() {
        playlist = [];
        currentMedia = 0;
        mediaNB = 0;
    }

    var getAlbumArt = function(url) {
        new jsmediatags.Reader(url)
        .setTagsToRead(["picture", "artist", "album", "track"])
        .read({
            onSuccess: function(tag) {
                var tags = tag.tags;
                var image = tags.picture;
                if (image) {
                    var base64String = "";
                    for (var i = 0; i < image.data.length; i++) {
                        base64String += String.fromCharCode(image.data[i]);
                    }
                    var dataUrl = "data:" + image.format + ";base64," + window.btoa(base64String);
                    api.setCover(dataUrl);
                }
            },
            onError: function(error) {
                console.log(error);
            }
        });
    }

    var guess_idx = function() {
        idx = Math.floor(Math.random()*mediaNB);
        if (idx == currentMedia) {
            return guess_idx();
        }
        else return idx;
    };

    var openAMedia = function(path) {
        var file = new FlatOS.File(path);
        file_info.internalPath = path;
        file_info.type = file.extension();
        file_info.mimetype = file.mimetype();
        file_info.path = file.externalPath();
        file_info.fspath = file.fileSystemPath();
        file_info.name = file.filename();
        file_info.size = file.sizeInOctets();
        filetype = file_info.mimetype.split('/')[0];
        _c.addClass(filetype);
        if (api) {
            _c.mplayer($.extend({}, api.conf, {type: filetype}));
        }
        else {
            _c.mplayer(filetype);
        }
        api = _c.data('mplayer');
        api.playing = true;
        api.load(file_info.fspath, function() {
            getAlbumArt(file_info.fspath);
            _w.setWidth(api.video.width);
            _w.setHeight(api.video.height);
        });
        api.next = function() {
            if ((mediaNB > 1) || (api.conf.loop)) {
                if (api.conf.shuffle) {
                    currentMedia = guess_idx(true);
                }
                else currentMedia++;
                if (currentMedia >= playlist.length) {
                    currentMedia = 0;
                }
                openAMedia(playlist[currentMedia].path);
            }
        };
        api.prev = function() {
            if ((mediaNB > 1) || (api.conf.loop)) {
                if (api.conf.shuffle) {
                    currentMedia = guess_idx(false);
                }
                else currentMedia--;
                if (currentMedia < 0) {
                    currentMedia = playlist.length - 1;
                }
                openAMedia(playlist[currentMedia].path);
            }
        };
        api.on('timeupdate', function() {
            _t.loadingIndicator(api.finishPercentage());
        });

        check_is_playing();
    };

    var openMedia = function(path) {
        clear_playlist();
        if (typeof path === 'undefined') {
            var opts = {parent_pid: this_process_name, parent_iid: instance};
            if (typeof file_info.internalPath != 'undefined') {
                var file = new FlatOS.File(file_info.internalPath);
                opts.startAt = file.dirname();
            }
            var selector = new FlatOS.System.FileSelectorWindow(opts, function(filepath) {
                addToPlaylist(filepath);
                openAMedia(filepath);
            });
        }
        else {
            addToPlaylist(path);
            openAMedia(path);
        }
    };

    var addToPlaylist = function(filepath) {
        var info = new FlatOS.File(filepath);
        new jsmediatags.Reader(info.fileSystemPath())
        .setTagsToRead(["picture", "title", "artist", "album", "track"])
        .read({
            onSuccess: function(tag, path) {
                var tags = tag.tags;
                var image = tags.picture;
                if (image) {
                    var base64String = "";
                    for (var i = 0; i < image.data.length; i++) {
                        base64String += String.fromCharCode(image.data[i]);
                    }
                    var dataUrl = "data:" + image.format + ";base64," + window.btoa(base64String);
                }
                else {
                    dataUrl = '';
                }
                playlist[mediaNB] = {picture: dataUrl, title: tags.title, artist: tags.artist, album: tags.album, track: tags.track, path: '/'+path};
                mediaNB++;
                update_playlist();
            },
            onError: function(error) {
                playlist[mediaNB] = {picture: '', title: info.basename(), artist: 'Unknow', album: 'Unknow', track: 'Unknow', path: '/'+path};
                mediaNB++;
                update_playlist();
            }
        });
    };

    var showMediaInfo = function(idx) {
        $(["title", "artist", "album", "track"]).each(function() {
            $_w.find('.fp-media-info-'+this).text(playlist[idx][this]);
        });
        $_w.find('.fp-media-info-picture').attr('src', playlist[idx].picture);
    };

    var update_playlist = function() {
        var $p = $_w.find('.fp-playlist-items-list');
        $p.empty();
        for (var i = 0, l = playlist.length; i < l; i++) {
            $p.append('<a href="#" data-playlist-item-id="'+i+'" data-playlist-item-name="'+playlist[i].title+'" data-internal-path="'+playlist[i].path+'" class="playlist-item">'+playlist[i].title+'</a>');
        }
        var $a = $p.find('.playlist-item');
        $a
        .click(function(e) {
            e.preventDefault();
            $p.find('a').removeClass('selected');
            $(this).addClass('selected');
            showMediaInfo(parseInt($(this).attr('data-playlist-item-id')));
        })
        .dblclick(function(e) {
            e.preventDefault();
            currentMedia = parseInt($(this).attr('data-playlist-item-id'));
            openAMedia($(this).attr('data-internal-path'));
        })
        .each(function(idx) {
            $(this).contextualMenu(
                {
                    manage: {
                        play_next: {
                            name: 'Play next',
                            callback: function() {
                                if (idx < currentMedia) {
                                    item = playlist.splice(idx, 1);
                                    extract = playlist.splice(currentMedia);
                                    playlist = playlist.concat(item.concat(extract));
                                    currentMedia--;
                                }
                                else {
                                    item = playlist.splice(idx, 1);
                                    extract = playlist.splice(currentMedia+1);
                                    playlist = playlist.concat(item.concat(extract));
                                }
                                update_playlist();
                            }
                        },
                        remove: {
                            name: 'Remove from list',
                            callback: function() {
                                playlist.splice(idx, 1);
                                mediaNB -= 1;
                                update_playlist();
                            }
                        }
                    }
                }
            );
        });
        check_is_playing();
    };

    var showPlaylist = function() {
        if (inPlaylist) {
            $_w.find('.fp-playlist-items').animate({left: '-100%'});
            _c.animate({left: 0});
            inPlaylist = false;
        }
        else {
            $_w.find('.fp-playlist-items').animate({left: 0});
            _c.animate({left: '100%'});
            inPlaylist = true;
        }
    };

    var check_is_playing = function() {
        var $a = $_w.find('.playlist-item');
        $a.removeClass('is-playing selected');
        $a.each(function(idx) {
            if ($(this).attr('data-playlist-item-id') == currentMedia) {
                $a.removeClass('selected');
                $(this).addClass('is-playing selected');
                showMediaInfo(idx);
            }
        });
    };

    var update_library = function() {
        var folders_to_scan = [];

        library_items = {
            artist: {},
            album: {},
            raw: []
        };

        if (config.useMusicFolder) {
            folders_to_scan.push(_u.userDir('Music'));
        }

        folders_to_scan = folders_to_scan.concat(config.mediaLibrary);
        var exts = new FlatOS.System.DefaultAppsManager().getRegExt(this_process_name);

        for (var i = 0, l = folders_to_scan.length; i < l; i++) {
            var f = new FlatOS.File(folders_to_scan[i]);
            var file_list = f.read(true);
            for (var file in file_list) {
                var info = new FlatOS.File(file_list[file]);
                var ext  = info.extension();
                if (~exts.indexOf(ext)) {
                    var filepath = info.fileSystemPath();
                    new jsmediatags.Reader(filepath)
                    .setTagsToRead(["picture", "title", "artist", "album", "track"])
                    .read({
                        onSuccess: function(tag, path) {
                            var tags = tag.tags;
                            $(['artist', 'album']).each(function() {
                                if (typeof library_items[this][tags[this]] === 'undefined') {
                                    library_items[this][tags[this]] = [];
                                }
                                library_items[this][tags[this]].push({
                                    album: tags.album,
                                    title: tags.title,
                                    artist: tags.artist,
                                    track: tags.track,
                                    path: path
                                });
                            });
                            library_items.raw.push({
                                album: tags.album,
                                title: tags.title,
                                artist: tags.artist,
                                track: tags.track,
                                path: path
                            });
                            config.libraryItems = library_items;
                            _a.saveConfigFile(JSON.stringify(config));
                        },
                        onError: function(error, path) {
                            $(['artist', 'album']).each(function() {
                                if (typeof library_items[this].Unknow === 'undefined') {
                                    library_items[this].Unknow = [];
                                }
                                library_items[this].Unknow.push({
                                    album: 'Unknow',
                                    title: info.basename(),
                                    artist: 'Unknow',
                                    track: 'Unknow',
                                    path: path
                                });
                            });
                            library_items.raw.push({
                                album: 'Unknow',
                                title: info.basename(),
                                artist: 'Unknow',
                                track: 'Unknow',
                                path: path
                            });
                            config.libraryItems = library_items;
                            _a.saveConfigFile(JSON.stringify(config));
                        }
                    });
                }
            }
        }
    };

    var update_library_view = function(by) {
        switch (by) {
            case view_by_album:
                for (var album in library_items.album) {
                    var cover = title = '';
                    var $wrapper = $('<div class="fp-album"></div>');
                    var $list = $('<div class="fp-album-list"></div>');
                    for (var i = 0, l = library_items.album[album].length; i < l; i++) {
                        $list.append($('<a href="#" data-internal-path="/'+library_items.album[album][i].path+'">'+library_items.album[album][i].track+'. '+library_items.album[album][i].title+'</a>').click(function(e) {
                            e.preventDefault();
                            openMedia($(this).attr('data-internal-path'));
                        }));
                        if (library_items.album[album][i].album.length > 0) {
                            title = library_items.album[album][i].album;
                        }
                    }
                    $wrapper
                        .append('<div class="fp-album-title"><span>'+title+'</span></div>')
                        .append('<div class="fp-album-art-box"><img class="fp-album-art" src="'+cover+'" /></div>')
                        .append($list)
                        .appendTo($_w.find('.fp-playlist-items-content'));
                }
            break;
        }
    };

    $_w.find('.fp-playlist').click(function () {
        showPlaylist();
    });

//    _w.on('init', function() {
//        update_library();
        update_library_view(view_by_album);
//    });


    _a.registerCommand('open', openMedia);

    _a.setContextMenuAction('play_media', openMedia);
    _a.setContextMenuAction('add_playlist', addToPlaylist);

})(jQuery);