+function ($) {

    FlatOS.Window = function (process_name, instance_id) {
        this.process_name = process_name;
        this.instance_id  = (typeof instance_id === 'undefined') ? this.getInstanceID() : instance_id;
    };


    FlatOS.Window.prototype._removeAnimationsClasses = function () {
        this.get().removeClass('zoomIn');
        this.get().removeClass('fadeInLeft');
        this.get().removeClass('fadeInRight');
        this.get().removeClass('zoomOut');
        this.get().removeClass('shake');
    };

    FlatOS.Window.prototype.about = function () {
        new FlatOS.System.Application.AboutAppDialog(this.process_name, this.instance_id);
    };

    FlatOS.Window.prototype.get = function () {
        return F.Window.get(this.process_name, this.instance_id);
    };

    FlatOS.Window.prototype.getInstanceID = function () {
        return F.Window.getInstanceID(this.process_name);
    };

    FlatOS.Window.prototype.instanceID = function() {
        return this.instance_id;
    };

    FlatOS.Window.prototype.lock = function () {
        if (!this.isLocked()) {
            this.get().find('.content').prepend('<div class="flatos-locked-window-screen animated fadeIn"></div>');
            this.locked = true;
        }
    };

    FlatOS.Window.prototype.unlock = function () {
        if (this.isLocked()) {
            var $el = this.get().find('.flatos-locked-window-screen').removeClass('fadeIn').addClass('fadeOut');
            setTimeout(function() {
                $el.remove();
            }, 500);
            this.locked = false;
        }
    };

    FlatOS.Window.prototype.isLocked = function () {
        return this.locked;
    };

    FlatOS.Window.prototype.on = function (action, callback) {
        F.Window.on(action, this.process_name, callback, this.instance_id);
    };

    FlatOS.Window.prototype.unbind = function (action) {
        var Callback = new FlatOS.Callback();
        var index = this.process_name+'_'+this.instance_id;
        switch (action) {
            case 'all':
                Callback.removeAll(index);
            break;

            case 'close':
                Callback.remove('onClose', index);
            break;

            case 'resizeBegin':
                Callback.remove('onResizeBegin', index);
            break;

            case 'resizing':
                Callback.remove('onResizing', index);
            break;

            case 'resizeEnd':
                Callback.remove('onResizeEnd', index);
            break;

            case 'maximize':
                Callback.remove('onMaximize', index);
            break;

            case 'minimize':
                Callback.remove('onMinimize', index);
            break;

            case 'hide':
                Callback.remove('onHide', index);
            break;

            case 'dragBegin':
                Callback.remove('onDragBegin', index);
            break;

            case 'dragging':
                Callback.remove('onDragging', index);
            break;

            case 'dragEnd':
                Callback.remove('onDragEnd', index);
            break;

            case 'focus':
                Callback.remove('onFocus', index);
            break;

            case 'update':
                Callback.remove('onFrameUpdate', index);
            break;
        }
    };

    FlatOS.Window.prototype.open = function (options) {
        F.Window.create($.extend({parent: this.process_name}, options));
    };

    FlatOS.Window.prototype.overwrite = function (action, callback) {
        F.Window.overwrite(action, this.process_name, callback, this.instance_id);
    };

    FlatOS.Window.prototype.focus = function (cin) {
        F.Window.switch_to(this.get());
        if ($.isFunction(cin)) {
            cin();
        }
    };

    FlatOS.Window.prototype.isFocused = function () {
        return parseInt(this.get().attr('data-current-window')) === 1;
    };

    FlatOS.Window.prototype.hide = function () {
        F.Window.hide(F.Window.get(this.process_name, this.instance_id));
    };

    FlatOS.Window.prototype.maximize = function () {
        F.Window.maximize(F.Window.get(this.process_name, this.instance_id));
    };

    FlatOS.Window.prototype.close = function () {
        F.Window.close(F.Window.get(this.process_name, this.instance_id));
    };

    FlatOS.Window.prototype.restore = function () {
        F.Window.restore(F.Window.get(this.process_name, this.instance_id));
    };

    FlatOS.Window.prototype.setMenuAction = function (menuID, callback) {
        F.Window.Menu.setAction(this.process_name, this.instance_id, menuID, callback);
    };

    FlatOS.Window.prototype.instanciate = function (options) {
        F.Application.launch($.extend({}, options, {process_name: this.process_name}));
    };

    FlatOS.Window.prototype.dialogConfirm = function (options, callback) {
        new FlatOS.System.Application.ConfirmDialog(
            $.extend({
                parent_pid: this.process_name,
                parent_iid: this.instance_id
            }, options)
        , callback);
    };

    FlatOS.Window.prototype.dialogAlert = function (options, callback) {
        new FlatOS.System.AlertWindow({
                parent_pid: this.process_name,
                parent_iid: this.instance_id,
                content: content
        }, callback);
    };

    FlatOS.Window.prototype.setTitle = function (title) {
        F.Window.setTitle(this.process_name, this.instance_id, title);
    };

    FlatOS.Window.prototype.getTitle = function () {
        return F.Window.getTitle(this.process_name, this.instance_id);
    };

    FlatOS.Window.prototype.addShortcut = function (shortcut, callback, target) {
        if (typeof target === 'undefined') {
            FlatOS.Shortcut.add(shortcut, callback, { target: 'flatos_app_'+this.process_name+'_'+this.instance_id });
        }
        else {
            FlatOS.Shortcut.add(shortcut, callback, { target: target });
        }
    };

    FlatOS.Window.prototype.width = function (w) {
        return this.get().outerWidth();
    };

    FlatOS.Window.prototype.height = function (h) {
        return this.get().outerHeight();
    };

    FlatOS.Window.prototype.setWidth = function (w) {
        if (w > 0) {
            this.get().css('width', w);
            F.Window.resize_main_content(this.get());
        }
    };

    FlatOS.Window.prototype.setHeight = function (h) {
        if (h > 0) {
            this.get().css('height', h);
            F.Window.resize_main_content(this.get());
        }
    };

    FlatOS.Window.prototype.shake = function () {
        var that = this;
        this._removeAnimationsClasses();
        this.get().addClass('shake');
        setTimeout(function() {
            that._removeAnimationsClasses();
        }, 500);
    };

}(jQuery);