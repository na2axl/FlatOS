// Ajax Cache
F.Cache.Ajax = {
    timeout: 300000,
    data: {},
    remove: function (url) {
        delete F.Cache.Ajax.data[url];
    },
    exist: function (url) {
        return !!F.Cache.Ajax.data[url] && ((new Date().getTime() - F.Cache.Ajax.data[url]._) < F.Cache.Ajax.timeout);
    },
    get: function (url) {
        return F.Cache.Ajax.data[url].data;
    },
    set: function (url, cachedData, callback) {
        F.Cache.Ajax.remove(url);
        F.Cache.Ajax.data[url] = {
            _: new Date().getTime(),
            data: cachedData
        };
        if ($.isFunction(callback)) callback(cachedData);
    }
};

// Callbacks Cache
F.Cache.Callback = undefined;

// File Explorer Cache
F.Cache.Explorer = {};

// Context Menu Cache
F.Cache.Context = {};

// Applications Cache
F.Cache.Application = {};