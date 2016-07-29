+function($) {

    FlatOS.UI.Desktop = function() {
        // @ignore
    };

    FlatOS.UI.Desktop.prototype._loadIcons = function() {
        new FlatOS.Api.User(function(file_list) {
            var $ul = $('<ul id="desktop-icons" class="icons medium"></ul>');
            for ( var file in file_list ) {
                var icon = new FlatOS.UI.Icon(file_list[file].path);
                var $li = $('<li data-file-basename="'+file+'" data-internal-path="'+file_list[file].path+'"></li>');
                $li
                    .append(icon.getFileIcon())
                    .append('<span>'+file+'</span>')
                    .click(function() {
                        $ul.find('li').removeClass('selected');
                        $(this).addClass('selected');
                    });
                $li.appendTo($ul);
            }
            $ul.appendTo('#windows');
        }).listUserDir('Desktop');
    };

    FlatOS.UI.Desktop.prototype.load = function(callback, timeOut) {
        callback      = callback || null;
        timeOut       = timeOut  || 0;
        var User      = new FlatOS.System.User();
        var that      = this;
        new FlatOS.Layout('main-desktop.html', function(html) {
            var user = User.username();
            var config = new FlatOS.System.UserConfig(user).getConfig('ui');
            var bg_img = User.getTruePath(config['background-image'], user);
            var bg_rpt = config['background-repeat'];
            var bg_mod = config['background-mode'];
            var $html = $(html);
            that.changeBackgroundImage(bg_img, $html);
            that.changeBackgroundTileMode(bg_rpt, $html);
            that.changeBackgroundMode(bg_mod, $html);

            new FlatOS.Interface().set("#desktop-wrapper", $html.hide(), true);

            that._loadIcons();

            setTimeout(callback, timeOut);
        });
    };

    FlatOS.UI.Desktop.prototype.changeBackgroundTileMode = function(mode, html) {
        html = html || $("#desktop-wrapper");
        mode ? $(html).find("#background").css('background-repeat', 'repeat') : $(html).find("#background").css('background-repeat', 'no-repeat');
    };

    FlatOS.UI.Desktop.prototype.changeBackgroundImage = function(image, html) {
        html = html || $("#desktop-wrapper");
        $(html).find("#background").css('background-image', 'url("'+image+'")');
    };

    FlatOS.UI.Desktop.prototype.changeBackgroundMode = function(mode, html) {
        html = html || $("#desktop-wrapper");
        switch (mode) {
            case 'fit':
                $(html).find("#background").css('background-size', 'auto 100%');
                $(html).find("#background").css('background-position', 'center center');
            break;

            case 'fill':
                $(html).find("#background").css('background-size', '100% auto');
                $(html).find("#background").css('background-position', 'center center');
            break;

            case 'stretch':
                $(html).find("#background").css('background-size', '100% 100%');
                $(html).find("#background").css('background-position', 'center center');
            break;

            case 'tile':
                $(html).find("#background").css('background-size', 'unset');
                $(html).find("#background").css('background-repeat', 'repeat');
            break;

            case 'center':
                $(html).find("#background").css('background-size', 'unset');
                $(html).find("#background").css('background-position', 'center center');
            break;
        }
    };

}(jQuery);