+function ($) {

    FlatOS.System.Events = function () {  };

    FlatOS.System.Events.prototype.addStartingEvent = function(id, callback) {
        PATH = 'system/etc/events/startup.json';
        var FS = new FlatOS.System.FS();

        var events = $.parseJSON(FS.read(PATH));
        var starting_events = $.extend({}, events);
        starting_events[id] = callback.toString();
        FS.write(PATH, JSON.stringify(starting_events));
    };

    FlatOS.System.Events.prototype.triggerStartingEvents = function() {
        PATH = 'system/etc/events/startup.json';
        var FS = new FlatOS.System.FS();

        var events = $.parseJSON(FS.read(PATH));

        /**
         * TODO : Try to convert a string to a function and call it.
         */
        for (var event in events) {
            // var functionCall = eval("(" + events[event] + ")");
            // var functionCall = new Function(events[event]);
            // functionCall.call();
            // console.log(functionCall.name);
            (eval("(" + events[event] + ")"))();
        }
    };

    FlatOS.System.Events.prototype.addScheduledEvent = function() {};

    FlatOS.System.Events.prototype.addShutingdownEvent = function() {};

}(jQuery);