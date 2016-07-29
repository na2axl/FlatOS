+function ($) {

    FlatOS.UI.TaskBar = function(opt) {
        if (typeof opt === 'string') {
            opt = {process_name: opt};
        }

        this.options = $.extend( {}, {process_name: '', instance_id: 0}, opt );
    };

    FlatOS.UI.TaskBar.prototype.load = function() {
        F.Taskbar.load();
    };

    FlatOS.UI.TaskBar.prototype.refresh = function() {
        F.Taskbar.refresh();
    };

    FlatOS.UI.TaskBar.prototype.get = function() {
        return F.Taskbar.get(this.options.process_name, this.options.instance_id);
    };

    FlatOS.UI.TaskBar.prototype.notify = function() {
        F.Taskbar.alarm(this.options.process_name, this.options.instance_id);
    };

    FlatOS.UI.TaskBar.prototype.setTitle = function(title) {
        F.Taskbar.setTitle(this.options.process_name, this.options.instance_id);
    };

    FlatOS.UI.TaskBar.prototype.is = function() {
        return F.Taskbar.is(this.options.process_name, this.options.instance_id);
    };

    FlatOS.UI.TaskBar.prototype.add = function() {
        F.Taskbar.add(this.options.process_name, this.options.instance_id);
    };

    FlatOS.UI.TaskBar.prototype.remove = function() {
        F.Taskbar.remove(this.options.process_name, this.options.instance_id);
    };

}(jQuery);