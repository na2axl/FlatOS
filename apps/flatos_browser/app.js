(function($) {
    var _w = new FlatOS.Window('flatos_browser'),
        _a = new FlatOS.Application('flatos_browser'),
        _t = new FlatOS.UI.TaskBar('flatos_browser', _w.getInstanceID()),
        _m = new FlatOS.Input.Mouse(),
        _f = new FlatOS.System.FS();
        _h = new FlatOS.Ajax();

    var instance = _w.getInstanceID();

    var h = [],
        i = 0;

    $("#webnavigo_browser_page").attr('id', 'webnavigo_browser_page_'+instance);
    $("#webnavigo_browser_form").attr('id', 'webnavigo_browser_form_'+instance);
    $("#webnavigo_browser_url").attr('id', 'webnavigo_browser_url_'+instance);
    $("#webnavigo_browser_refresh").attr('id', 'webnavigo_browser_refresh_'+instance);
    $("#webnavigo_browser_arrow_left").attr('id', 'webnavigo_browser_arrow_left_'+instance);
    $("#webnavigo_browser_arrow_right").attr('id', 'webnavigo_browser_arrow_right_'+instance);
    $("#webnavigo_browser_loading").attr('id', 'webnavigo_browser_loading_'+instance);

    var webNavigo_setURI = function(uri) {
        var path = _f.removeHostFromPath(uri);
        if (path != ('/' + _a.getURI() + '/data/default.html')) {
            $('#webnavigo_browser_url_'+instance).val(uri);
        }
        $('#webnavigo_browser_page_'+instance).attr('src', uri);
        $('#webnavigo_browser_loading_'+instance).children('img').show();
        // _h.request({
        //     url: uri,
        //     dataType: 'html',
        //     crossDomain: true,
        //     headers: {
        //         'Access-Control-Allow-Origin': true
        //     },
        //     beforeSend: function(jqXHR, opt) {
        //         jqXHR.setRequestHeader('Access-Control-Allow-Origin', true);
        //     },
        //     success: function() {
        //         $('#webnavigo_browser_page_'+instance).attr('src', uri);
        //         $('#webnavigo_browser_loading_'+instance).children('img').show();
        //     },
        //     error: function() {
        //         $('#webnavigo_browser_page_'+instance).attr('src', _a.getURI() + '/data/default.html');
        //     }
        // })
    };

    var webNavigo_getURI = function() {
        frame = document.getElementById('webnavigo_browser_page_'+instance).contentDocument;
        return frame.location.toString();
    };

    var webNavigo_setTitle = function(title) {
        _w.setTitle(title + ' - Web NaviGO');
    };

    var webNavigo_goPrev = function() {
        if (typeof h[i-1] !== 'undefined') {
            i--;
            webNavigo_setURI(h[i]);
            $("#webnavigo_browser_page_"+instance).one('load.webnavigo.webpage.prev', function() {
                h.pop();
            });
        }
    };

    var webNavigo_goNext = function() {
        if (typeof h[i+1] !== 'undefined') {
            i++;
            webNavigo_setURI(h[i]);
            $("#webnavigo_browser_page_"+instance).one('load.webnavigo.webpage.next', function() {
                h.pop();
            });
        }
    };

    var webNavigo_default = function () {
        webNavigo_setURI(_a.getURI() + '/data/default.html');
        $('#webnavigo_browser_url_'+instance).val('about:blank');
        $("#webnavigo_browser_page_"+instance).on('load.webnavigo.webpage', function() {
            var frame = document.getElementById('webnavigo_browser_page_'+instance).contentDocument;
            console.log(frame);
            $(frame).find('.webnavigo_browser_form').submit(function(e) {
                e.preventDefault();
                e.stopPropagation();
                var request_uri = $(frame).find('.webnavigo_browser_url').val();
                var protocol = request_uri.split('://');
                if (protocol[0] != 'http' && protocol[0] != 'https' && protocol[0] != 'ftp' && protocol[0] != 'data' && protocol[0] != 'file') {
                    request_uri = 'https://www.google.com/search?q='+encodeURIComponent(request_uri)+'&ie=utf-8&oe=utf-8';
                }
                webNavigo_setURI(request_uri);
            });
        });
    };

    $('#webnavigo_browser_loading_'+instance).children('img').attr('src', _a.getURI() + '/data/loading.gif');

    $('#webnavigo_browser_refresh_'+instance).click(function() {
        webNavigo_setURI(webNavigo_getURI());
    });

    $('#webnavigo_browser_arrow_left_'+instance).click(function() {
        webNavigo_goPrev();
    });

    $('#webnavigo_browser_arrow_right_'+instance).click(function() {
        webNavigo_goNext();
    });

    $('#webnavigo_browser_form_'+instance).submit(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var request_uri = $('#webnavigo_browser_url_'+instance).val();
        var protocol = request_uri.split('://');
        if (protocol[0] != 'http' && protocol[0] != 'https' && protocol[0] != 'ftp' && protocol[0] != 'data' && protocol[0] != 'file') {
            request_uri = 'https://www.google.com/search?q='+encodeURIComponent(request_uri)+'&ie=utf-8&oe=utf-8';
        }
        webNavigo_setURI(request_uri);
    });

    $("#webnavigo_browser_page_"+instance).on('load.webnavigo.webpage', function() {
        var frame = document.getElementById('webnavigo_browser_page_'+instance).contentDocument;
        var last_loc = $('#webnavigo_browser_url_' + instance).val();
        var path = _f.removeHostFromPath(frame.location.toString());
        if (path != ('/' + _a.getURI() + '/data/default.html')) {
            $('#webnavigo_browser_url_'+instance).val(frame.location);
        }
        if (frame.title.length > 50) {
            webNavigo_setTitle(frame.title.substring(0, 51) + '...');
        }
        else {
            webNavigo_setTitle(frame.title);
        }
        $('#webnavigo_browser_loading_'+instance).children('img').hide();
        $(frame).find('a').click(function() {
            $('#webnavigo_browser_loading_'+instance).children('img').show();
        });
        if (last_loc != frame.location.toString()) {
            h.push(last_loc);
            i = h.length;
        }
        _t.notify('The page is loaded.');
    });

    _w.on('init', function () {
        webNavigo_default();
    });

    _w.setMenuAction('open', function() {
        new FlatOS.System.FileSelectorWindow({}, function(file) {
            var filename = new FlatOS.ApiFS(function(name) {
                webNavigo_setURI(name);
            });
            filename.toExternalPath(file);
        });
    });

    _w.addShortcut('Ctrl+Alt+R', function() { webNavigo_setURI(webNavigo_getURI()) });
    _w.addShortcut('Ctrl+Alt+R', function() { webNavigo_setURI(webNavigo_getURI()) }, "webnavigo_browser_page_"+instance);
})(jQuery);