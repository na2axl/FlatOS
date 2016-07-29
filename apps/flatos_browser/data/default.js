(function(FlatOS, F, $) {

    var _a = new FlatOS.Application('flatos_browser'),
        _d = window.document;

    new FlatOS.Require({
        path: [
            '/system/ui/core/interface/reset.css'
        ],
        type: 'css',
        load: 'contents',
        context: $(_d.head)
    });

    $(_d)
        .find(".webnavigo_default_home_logo")
        .children('img')
        .attr('src', '/' +_a.getURI() + '/app.svg');

    $(_d)
        .find(".webnavigo_browser_url")
        .on("focusin.webnavigo.geturl", function(e) {
             $(this).addClass('active');
             $(_d).find(".button.ok").addClass('active');
        })
        .on("focusout.webnavigo.geturl", function(e) {
             $(this).removeClass('active');
             $(_d).find(".button.ok").removeClass('active');
        });

})(window.top.FlatOS, window.top.F, window.top.$)