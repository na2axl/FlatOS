(function($)
{

    var Callback = new FlatOS.Callback();

    Callback.add('onInit', 'ui_flatos_window', function(w) {
        $(w).addClass('animated zoomIn');
    })

    Callback.add('onHide', 'ui_flatos_window', function (w) {
        $(w)
            .removeClass('fadeInLeftBig zoomIn')
            .addClass('fadeOutLeftBig')
            .css({opacity: 0});
    });

    Callback.add('onMaximize', 'ui_flatos_window', function (w) {
       $(w).css({width: "100%", height: "100%", top: 0, left: 0});
    });

    Callback.add('onClose', 'ui_flatos_window', function (w) {
        $(w)
            .removeClass('zoomIn fadeInLeftBig fadeOutLeftBig')
            .addClass('zoomOut');
    });

    Callback.add('onRestore', 'ui_flatos_window', function (w) {
        $(w)
            .removeClass('fadeOutLeftBig zoomIn')
            .addClass('fadeInLeftBig')
            .css({opacity: 1});
    });

    Callback.add('onMinimize', 'ui_flatos_window', function (w) {
        var new_sizes     = $(w).attr('data-last-size').split(',');
        var new_positions = $(w).attr('data-last-position').split(',');
        $(w).css({width: new_sizes[0], height: new_sizes[1], top: new_positions[0], left: new_positions[1]});
    });

})(jQuery);