(function($) {

    $(document).ready(function() {
        var Interface = new FlatOS.Interface();

        // Initialize the OS
        Interface.boot();

        // Loading the authentification screen
        Interface.authenticate();
    });

})(jQuery);