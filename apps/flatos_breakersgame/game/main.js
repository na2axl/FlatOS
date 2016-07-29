(function(FlatOS, F, $) {

    var _a = new FlatOS.Application('flatos_breakersgame'),
        _d = window.document;

    new FlatOS.Require({
        path: [
            '/system/ui/core/interface/reset.css'
        ],
        type: 'css',
        load: 'contents',
        context: $(_d.head)
    });

})(window.top.FlatOS, window.top.F, window.top.$);