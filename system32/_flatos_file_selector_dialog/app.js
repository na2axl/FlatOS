(function($) {
    var _w = new FlatOS.Window('_flatos_file_selector_dialog');

    var instance = _w.getInstanceID();

    $("table#explorer_files_list").attr('id', 'explorer_files_list_'+instance);
    $("table#explorer_user_folders").attr('id', 'explorer_user_folders_'+instance);
    $("div#explorer_file_wait").attr('id', 'explorer_file_wait_'+instance);
})(jQuery);