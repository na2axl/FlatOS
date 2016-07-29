+function ($) {

    FlatOS.Cache.Explorer = function () { };

    FlatOS.Cache.Explorer.prototype.add = function(parent, child) {
        if (typeof F.Cache.Explorer[parent] === 'undefined') {
            F.Cache.Explorer[parent] = [];
        }
        if (!!~F.Cache.Explorer[parent].indexOf(child)) {
            F.Cache.Explorer[parent].push(child);
        }
    };

    FlatOS.Cache.Explorer.prototype.remove = function(parent, child) {
        if (typeof parent === 'undefined') {
            F.Cache.Explorer = {};
        }
        else {
            if (typeof child === 'undefined') {
                delete F.Cache.Explorer[parent];
            }
            else {
                if (!!~F.Cache.Explorer[parent].indexOf(child)) {
                    delete F.Cache.Explorer[parent][F.Cache.Explorer[parent].indexOf(child)];
                }
            }
        }
    };

    FlatOS.Cache.Explorer.prototype.get = function(parent, child) {
        if (parent && typeof F.Cache.Explorer[parent] === 'undefined') {
            if (child && !!~F.Cache.Explorer[parent].indexOf(child)) {
                return F.Cache.Explorer[parent][F.Cache.Explorer[parent].indexOf(child)];
            }
            else {
                return F.Cache.Explorer[parent];
            }
        }
        else {
            return F.Cache.Explorer;
        }
    };

}(jQuery);