+function ($) {

    FlatOS.Api.FS = function (callback) {
        this.api = new FlatOS.Api.Call({
            api_class: 'FS'
        }, callback);
    };

    FlatOS.Api.FS.prototype.mkfile = function (path, createParents) {
        this.api
            .setMethod('mkfile')
            .setArguments([path, createParents])
            .call();
    };

    FlatOS.Api.FS.prototype.read = function (path) {
        this.api
            .setMethod('read')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.write = function (path, data, append) {
        this.api
            .setMethod('write')
            .setArguments([path, data, append])
            .call();
    };

    FlatOS.Api.FS.prototype.delete = function (path, recursive) {
        this.api
            .setMethod('delete')
            .setArguments([path, recursive])
            .call();
    };

    FlatOS.Api.FS.prototype.move = function (path, new_path) {
        this.api
            .setMethod('move')
            .setArguments([path, new_path])
            .call();
    };

    FlatOS.Api.FS.prototype.rename = function (path, new_path) {
        this.move(path, new_path);
    };

    FlatOS.Api.FS.prototype.copy = function (path, new_path) {
        this.api
            .setMethod('copy')
            .setArguments([path, new_path])
            .call();
    };

    // FlatOS.Api.FS.prototype.upload;

    FlatOS.Api.FS.prototype.mkdir = function (path, recursive) {
        this.api
            .setMethod('mkdir')
            .setArguments([path, recursive])
            .call();
    };

    FlatOS.Api.FS.prototype.exists = function (path) {
        this.api
            .setMethod('exists')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.isDir = function (path) {
        this.api
            .setMethod('isDir')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.lastModTime = function (path) {
        this.api
            .setMethod('lastModTime')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.lastAccessTime = function (path) {
        this.api
            .setMethod('lastAccessTime')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.basename = function (path) {
        this.api
            .setMethod('basename')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.extension = function (path) {
        this.api
            .setMethod('extension')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.filename = function (path) {
        this.api
            .setMethod('filename')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.dirname = function (path) {
        this.api
            .setMethod('dirname')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.size = function (path) {
        this.api
            .setMethod('size')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.sizeInOctets = function (path) {
        this.api
            .setMethod('sizeInOctets')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.mimetype = function (path) {
        this.api
            .setMethod('mimetype')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.isBinary = function (path) {
        this.api
            .setMethod('isBinary')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.pathInfo = function (path, info) {
        this.api
            .setMethod('pathInfo')
            .setArguments([path, info])
            .call();
    };

    FlatOS.Api.FS.prototype.readDir = function (path, recursive, options) {
        this.api
            .setMethod('readDir')
            .setArguments([path, recursive, options])
            .call();
    };

    FlatOS.Api.FS.prototype.isRemote = function (path) {
        this.api
            .setMethod('isRemote')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.removeHostFromPath = function (path) {
        this.api
            .setMethod('removeHostFromPath')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.toInternalPath = function (path) {
        this.api
            .setMethod('toInternalPath')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.toExternalPath = function (path) {
        this.api
            .setMethod('toExternalPath')
            .setArguments([path])
            .call();
    };

    FlatOS.Api.FS.prototype.toFilesystemPath = function(path) {
        this.api
            .setMethod('toFilesystemPath')
            .setArguments([path])
            .call();
    };

}(jQuery);