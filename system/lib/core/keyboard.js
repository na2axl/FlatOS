+function ($) {

    FlatOS.Input.Keyboard = function() { };

    FlatOS.Input.Keyboard.prototype.keyDown = function (id, el, callback) {
        $(el).on('keydown.flatos.'+id, callback);
    };

    FlatOS.Input.Keyboard.prototype.keyDownOnce = function (id, el, callback) {
        $(el).one('keydown.flatos.'+id, callback);
    };

    FlatOS.Input.Keyboard.prototype.unbindKeyDown = function (id, el) {
        $(el).unbind('keydown.flatos.'+id);
    };

    FlatOS.Input.Keyboard.prototype.keyUp = function (id, el, callback) {
        $(el).on('keyup.flatos.'+id, callback);
    };

    FlatOS.Input.Keyboard.prototype.keyUpOnce = function (id, el, callback) {
        $(el).one('keyup.flatos.'+id, callback);
    };

    FlatOS.Input.Keyboard.prototype.unbindKeyUp = function (id, el) {
        $(el).unbind('keyup.flatos.'+id);
    };

}(jQuery);