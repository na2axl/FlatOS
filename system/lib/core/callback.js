+function ($) {

    FlatOS.Callback = function () {
        this.api = F.Cache.Callback;

        if (typeof this.api === 'undefined') {
            // Namespace
            this.api = {};

            // App window callbacks
            this.api.onFocus_callbacks = {};
            this.api.onClose_callbacks = {};
            this.api.onInit_callbacks = {};
            this.api.onResizeBegin_callbacks = {};
            this.api.onResizing_callbacks = {};
            this.api.onResizeEnd_callbacks = {};
            this.api.onDragBegin_callbacks = {};
            this.api.onDragging_callbacks = {};
            this.api.onDragEnd_callbacks = {};
            this.api.onMaximize_callbacks = {};
            this.api.onMinimize_callbacks = {};
            this.api.onRestore_callbacks = {};
            this.api.onHide_callbacks = {};
            this.api.onFrameUpdate_callbacks = {};

            // App callbacks
            this.api.open_commands = {};
            this.api.save_commands = {};

            // Contextual Menu callbacks
            this.api.cm_callbacks = {};

            // Triggers
            this.api.onStart_callbacks = {};
            this.api.onSignout_callbacks = {};

            // Save the API
            this._save();
        }
    };

    FlatOS.Callback.prototype._save = function () {
        F.Cache.Callback = this.api;
    };

    FlatOS.Callback.prototype.add = function (name, id, callback) {
        switch (name) {
            case 'onFocus':
                if (typeof this.api.onFocus_callbacks[id] === 'undefined') {
                    this.api.onFocus_callbacks[id] = [];
                }
                this.api.onFocus_callbacks[id].push(callback);
            break;

            case 'onClose':
                if (typeof this.api.onClose_callbacks[id] === 'undefined') {
                    this.api.onClose_callbacks[id] = [];
                }
                this.api.onClose_callbacks[id].push(callback);
            break;

            case 'onInit':
                if (typeof this.api.onInit_callbacks[id] === 'undefined') {
                    this.api.onInit_callbacks[id] = [];
                }
                this.api.onInit_callbacks[id].push(callback);
            break;

            case 'onResizeBegin':
                if (typeof this.api.onResizeBegin_callbacks[id] === 'undefined') {
                    this.api.onResizeBegin_callbacks[id] = [];
                }
                this.api.onResizeBegin_callbacks[id].push(callback);
            break;

            case 'onResizing':
                if (typeof this.api.onResizing_callbacks[id] === 'undefined') {
                    this.api.onResizing_callbacks[id] = [];
                }
                this.api.onResizing_callbacks[id].push(callback);
            break;

            case 'onResizeEnd':
                if (typeof this.api.onResizeEnd_callbacks[id] === 'undefined') {
                    this.api.onResizeEnd_callbacks[id] = [];
                }
                this.api.onResizeEnd_callbacks[id].push(callback);
            break;

            case 'onDragBegin':
                if (typeof this.api.onDragBegin_callbacks[id] === 'undefined') {
                    this.api.onDragBegin_callbacks[id] = [];
                }
                this.api.onDragBegin_callbacks[id].push(callback);
            break;

            case 'onDragging':
                if (typeof this.api.onDragging_callbacks[id] === 'undefined') {
                    this.api.onDragging_callbacks[id] = [];
                }
                this.api.onDragging_callbacks[id].push(callback);
            break;

            case 'onDragEnd':
                if (typeof this.api.onDragEnd_callbacks[id] === 'undefined') {
                    this.api.onDragEnd_callbacks[id] = [];
                }
                this.api.onDragEnd_callbacks[id].push(callback);
            break;

            case 'onMaximize':
                if (typeof this.api.onMaximize_callbacks[id] === 'undefined') {
                    this.api.onMaximize_callbacks[id] = [];
                }
                this.api.onMaximize_callbacks[id].push(callback);
            break;

            case 'onMinimize':
                if (typeof this.api.onMinimize_callbacks[id] === 'undefined') {
                    this.api.onMinimize_callbacks[id] = [];
                }
                this.api.onMinimize_callbacks[id].push(callback);
            break;

            case 'onRestore':
                if (typeof this.api.onRestore_callbacks[id] === 'undefined') {
                    this.api.onRestore_callbacks[id] = [];
                }
                this.api.onRestore_callbacks[id].push(callback);
            break;

            case 'onHide':
                if (typeof this.api.onHide_callbacks[id] === 'undefined') {
                    this.api.onHide_callbacks[id] = [];
                }
                this.api.onHide_callbacks[id].push(callback);
            break;

            case 'onFrameUpdate':
                if (typeof this.api.onFrameUpdate_callbacks[id] === 'undefined') {
                    this.api.onFrameUpdate_callbacks[id] = [];
                }
                this.api.onFrameUpdate_callbacks[id].push(callback);
            break;

            case 'onStart':
                if (typeof this.api.onStart_callbacks[id] === 'undefined') {
                    this.api.onStart_callbacks[id] = [];
                }
                this.api.onStart_callbacks[id].push(callback);
            break;

            case 'onSignout':
                if (typeof this.api.onSignout_callbacks[id] === 'undefined') {
                    this.api.onSignout_callbacks[id] = [];
                }
                this.api.onSignout_callbacks[id].push(callback);
            break;

            case 'open':
                this.api.open_commands[id] = callback;
            break;

            case 'save':
                this.api.save_commands[id] = callback;
            break;
        }
        this._save();
    };

    FlatOS.Callback.prototype.addContextualMenuAction = function (id, command, callback) {
        if (typeof this.api.cm_callbacks[id+'_'+command] === 'undefined') {
            this.api.cm_callbacks[id+'_'+command] = callback;
            this._save();
        }
    };

    FlatOS.Callback.prototype.call = function(name, id, args) {
        switch (name) {
            case 'onFocus':
                $(this.api.onFocus_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onClose':
                $(this.api.onClose_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onInit':
                $(this.api.onInit_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onResizeBegin':
                $(this.api.onResizeBegin_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onResizing':
                $(this.api.onResizing_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onResizeEnd':
                $(this.api.onResizeEnd_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onDragBegin':
                $(this.api.onDragBegin_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onDragging':
                $(this.api.onDragging_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onDragEnd':
                $(this.api.onDragEnd_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onMaximize':
                $(this.api.onMaximize_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onMinimize':
                $(this.api.onMinimize_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onRestore':
                $(this.api.onRestore_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onHide':
                $(this.api.onHide_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onFrameUpdate':
                $(this.api.onFrameUpdate_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onStart':
                $(this.api.onStart_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'onSignout':
                $(this.api.onSignout_callbacks[id]).each(function() {
                    this(args);
                });
            break;

            case 'open':
                if ($.isFunction(this.api.open_commands[id])) {
                    this.api.open_commands[id](args);
                }
            break;

            case 'save':
                if ($.isFunction(this.api.save_commands[id])) {
                    this.api.save_commands[id](args);
                }
            break;

            case 'contextMenu':
                if ($.isFunction(this.api.cm_callbacks[id])) {
                    this.api.cm_callbacks[id](args);
                }
            break;
        }
    };

    FlatOS.Callback.prototype.get = function(name, id) {
        switch (name) {
            case 'onFocus':
                return this.api.onFocus_callbacks[id];

            case 'onClose':
                return this.api.onClose_callbacks[id];

            case 'onInit':
                return this.api.onInit_callbacks[id];

            case 'onResizeBegin':
                return this.api.onResizeBegin_callbacks[id];

            case 'onResizing':
                return this.api.onResizing_callbacks[id];

            case 'onResizeEnd':
                return this.api.onResizeEnd_callbacks[id];

            case 'onDragBegin':
                return this.api.onDragBegin_callbacks[id];

            case 'onDragging':
                return this.api.onDragging_callbacks[id];

            case 'onDragEnd':
                return this.api.onDragEnd_callbacks[id];

            case 'onMaximize':
                return this.api.onMaximize_callbacks[id];

            case 'onMinimize':
                return this.api.onMinimize_callbacks[id];

            case 'onRestore':
                return this.api.onRestore_callbacks[id];

            case 'onHide':
                return this.api.onHide_callbacks[id];

            case 'onFrameUpdate':
                return this.api.onFrameUpdate_callbacks[id];

            case 'onStart':
                return this.api.onStart_callbacks[id];

            case 'onSignout':
                return this.api.onSignout_callbacks[id];

            case 'open':
                return this.api.open_commands[id];

            case 'save':
                return this.api.save_commands[id];

            case 'contextMenu':
                return this.api.cm_callbacks[id];
        }
    };

    FlatOS.Callback.prototype.remove = function(name, id) {
        switch (name) {
            case 'onFocus':
                this.api.onFocus_callbacks[id] = [];
            break;

            case 'onClose':
                this.api.onClose_callbacks[id] = [];
            break;

            case 'onInit':
                this.api.onInit_callbacks[id] = [];
            break;

            case 'onResizeBegin':
                this.api.onResizeBegin_callbacks[id] = [];
            break;

            case 'onResizing':
                this.api.onResizing_callbacks[id] = [];
            break;

            case 'onResizeEnd':
                this.api.onResizeEnd_callbacks[id] = [];
            break;

            case 'onDragBegin':
                this.api.onDragBegin_callbacks[id] = [];
            break;

            case 'onDragging':
                this.api.onDragging_callbacks[id] = [];
            break;

            case 'onDragEnd':
                this.api.onDragEnd_callbacks[id] = [];
            break;

            case 'onMaximize':
                this.api.onMaximize_callbacks[id] = [];
            break;

            case 'onMinimize':
                this.api.onMinimize_callbacks[id] = [];
            break;

            case 'onRestore':
                this.api.onRestore_callbacks[id] = [];
            break;

            case 'onHide':
                this.api.onHide_callbacks[id] = [];
            break;

            case 'onFrameUpdate':
                this.api.onFrameUpdate_callbacks[id] = [];
            break;

            case 'onStart':
                this.api.onStart_callbacks[id] = [];
            break;

            case 'onSignout':
                this.api.onSignout_callbacks[id] = [];
            break;

            case 'open':
                this.api.open_commands[id] = [];
            break;

            case 'save':
                this.api.save_commands[id] = [];
            break;

            case 'contextMenu':
                this.api.cm_callbacks[id] = [];
            break;
        }
        this._save();
    };

    FlatOS.Callback.prototype.removeAll = function(index) {
        this.api.onInit_callbacks[index] = [];
        this.api.onFocus_callbacks[index] = [];
        this.api.onClose_callbacks[index] = [];
        this.api.onResizeBegin_callbacks[index] = [];
        this.api.onResizing_callbacks[index] = [];
        this.api.onResizeEnd_callbacks[index] = [];
        this.api.onDragBegin_callbacks[index] = [];
        this.api.onDragging_callbacks[index] = [];
        this.api.onDragEnd_callbacks[index] = [];
        this.api.onMaximize_callbacks[index] = [];
        this.api.onMinimize_callbacks[index] = [];
        this.api.onRestore_callbacks[index] = [];
        this.api.onHide_callbacks[index] = [];
        this.api.onFrameUpdate_callbacks[index] = [];
        this._save();
    };

}(jQuery);