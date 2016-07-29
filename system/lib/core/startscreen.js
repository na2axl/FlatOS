+function($) {

    FlatOS.UI.StartScreen = function() {
        this._is_opened = false;
        this.load();
    };

    FlatOS.UI.StartScreen.prototype.load = function() {
        var User   = new FlatOS.System.User();
        var Mouse  = new FlatOS.Input.Mouse();
        var config = new FlatOS.System.UserConfig().getConfig('account');
        var avatar = User.getTruePath(config.acc_picture);

        $("#startscreen").find('.avatar').children('img').attr('src', avatar);
        $("#startscreen").find('.username').text(config.acc_display_name);

        var resizer_ratio   = function () {
            return parseFloat( $("#startscreen").find('.scroller').height() ) / parseFloat( $("#startscreen").find('.shortcuts').height() )
        };

        var resize_scroller = function () {
            $("#startscreen").find('.view').height( parseFloat( $("#startscreen").find('.shortcuts-wrapper').height() ) * resizer_ratio() );

        };

        var _scroll = function (e) {
            e.preventDefault();
            e.stopPropagation();
            var _mouseY = e.pageY - $("#startscreen").find('.shortcuts-wrapper').offset().top;
            $("#startscreen").find('.shortcuts-wrapper').scrollTop((_mouseY - (parseFloat($("#startscreen").find('.view').height())) / 2) / resizer_ratio());
        };

        $(window).on('resize.flatos.startscreen.scroller', resize_scroller).trigger('resize.flatos.startscreen.scroller');

        $("#startscreen").find('.shortcuts-wrapper').on('scroll.flatos.startsreen.scroller', function(e) {
            $("#startscreen").find('.view').css('top', parseFloat( $(this).scrollTop() ) * resizer_ratio() );
        });

        Mouse.buttonDown('startscreen.scroller', $("#startscreen").find('.view'), function (e) {
            $("#startscreen").find('.view').addClass('scrolling');
            e.stopPropagation();
            _scroll(e);
            $("#startscreen").bind('mousemove.flatos.startscreen.scroller', _scroll);
            Mouse.buttonUpOnce('startscreen.scroller', window, function () {
                $("#startscreen").find('.view').removeClass('scrolling');
                $("#startscreen").unbind('mousemove.flatos.startscreen.scroller');
            });
            e.preventDefault();0
        });

        Mouse.leftClick('startscreen.scroller', $("#startscreen").find('.scroller'), function (e) {
            e.stopPropagation();
            _scroll(e);
            e.preventDefault();
        });

        this._loadIcons(true);
    };

    FlatOS.UI.StartScreen.prototype.toggle = function() {
        if (this._is_opened) {
            this.close();
        } else {
            this.open();
        }
    };

    FlatOS.UI.StartScreen.prototype.open = function() {
        var that = this;
        $("#startscreen").removeClass('fadeOut').addClass('fadeIn').show();
        new FlatOS.Input.Keyboard().keyDownOnce('startscreen.close', window, function( e ) {
            if ( e.keyCode == 27 ) {
                that.close();
            }
        });
        $(window).trigger('resize.flatos.startscreen.scroller');
        this._is_opened = true;
    };

    FlatOS.UI.StartScreen.prototype.close = function() {
        $("#startscreen").removeClass('fadeIn').addClass('fadeOut');
        setTimeout(function() {
            $("#startscreen").hide();
            $("#startscreen").find("input.search-entry").val('');
        }, 500);
        this._is_opened = false;
    };

    FlatOS.UI.StartScreen.prototype._loadIcons = function(cleanBefore) {
        var that = this;
        if (cleanBefore) {
            $("#startscreen").children('.taskicon').remove();
        }
        var app_list = new FlatOS.System.FS().readDir('apps/');
        for (var app in app_list) {
            this.addIcon(app);
        }
    };

    FlatOS.UI.StartScreen.prototype.onLaunchApp = function() {
    };

    FlatOS.UI.StartScreen.prototype.addIcon = function(app) {
        var Application = new FlatOS.Application({ process_name: app });
        var app_info = Application.getInfo();
        var $taskicon = $('<div></div>');
        var that = this;

        $taskicon
            .attr({
                'class': "taskicon tooltip",
                'title': app_info.app_name,
                'data-process-id': app_info.process_id,
                'data-process-opener': 1
            })
            .append('<span class="icon"><img src="'+app_info.app_icon+'" /></span><span class="title">'+app_info.app_name+'</span>')
            .appendTo($('#startscreen').find('.shortcuts'));

        new FlatOS.Input.Mouse().leftClick('app.launch', $taskicon, function() {
            that.close();
            var app = new FlatOS.Application({ process_name: $(this).attr('data-process-id') });
            app.launch();
        });
    };

}(jQuery);