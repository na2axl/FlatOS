+function ($) {

    FlatOS.Notification = function(message) {
        message = message || '';
        this.$wrapper = $('<div class="flatos-notification-message-wrapper"></div>').text(message);

        this._show();
        var that = this;
        setTimeout(function() {
            that._hide();
        }, 10000);
    };

    FlatOS.Notification.prototype._show = function() {
        var that = this;

        this.$wrapper
            .hide(0)
            .appendTo($('#notification-wrapper').addClass('active'))
            .addClass('animated slideInRight active')
            .on('click.flatos.notification.hide', function() {
                that._hide();
            })
            .show(0);
    };

    FlatOS.Notification.prototype._hide = function() {
        var that = this;
        var notification = this.$wrapper.removeClass('active').removeClass('slideInRight').addClass('slideOutRight');
        var interval = setInterval(function() {
            var $notifications = $('#notification-wrapper').find('.active');
            if ($notifications.length === 0) {
                $('#notification-wrapper').removeClass('active');
                notification.remove();
                clearInterval(interval);
            }
        }, 500);
    };

    FlatOS.Notification.prototype._hideAll = function() {
        $('#notification-wrapper').removeClass('active').find('.active').each(function() {
            $(this).remove();
        });
    };

}(jQuery);