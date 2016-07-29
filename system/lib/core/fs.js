+function ($) {

    FlatOS.System.FS = function() {
        this.REAL_PATH = 1;
        this.INTERNAL_PATH = 2;
        this.EXTERNAL_PATH = 3;
        this.FILESYSTEM_PATH = 4;
    };

    FlatOS.System.FS.prototype.mkfile = function(path, createParents) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).mkfile(path, createParents);
        return result;
    }

    FlatOS.System.FS.prototype.read = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).read(path);
        return result;
    };

    FlatOS.System.FS.prototype.write = function(path, data, append) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).write(path, data, append);
        return result;
    };

    FlatOS.System.FS.prototype.delete = function(path, recursive) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).delete(path, recursive);
        return result;
    };

    FlatOS.System.FS.prototype.move = function(path, new_path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).move(path, new_path);
        return result;
    };

    FlatOS.System.FS.prototype.rename = function(path, new_path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).rename(path, new_path);
        return result;
    };

    FlatOS.System.FS.prototype.copy = function(path, new_path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).copy(path, new_path);
        return result;
    };

    FlatOS.System.FS.prototype.mkdir = function(path, recursive) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).mkdir(path, recursive);
        return result;
    };

    FlatOS.System.FS.prototype.exists = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).exists(path);
        return result;
    };

    FlatOS.System.FS.prototype.isDir = function (path) {
        var result;
        new FlatOS.Api.FS(function (r) {
            result = r;
        }).isDir(path);
        return result;
    };

    FlatOS.System.FS.prototype.lastModTime = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).lastModTime(path);
        return result;
    };

    FlatOS.System.FS.prototype.lastAccessTime = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).lastAccessTime(path);
        return result;
    };

    FlatOS.System.FS.prototype.basename = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).basename(path);
        return result;
    };

    FlatOS.System.FS.prototype.extension = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).extension(path);
        return result;
    };

    FlatOS.System.FS.prototype.filename = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).filename(path);
        return result;
    };

    FlatOS.System.FS.prototype.dirname = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).dirname(path);
        return result;
    };

    FlatOS.System.FS.prototype.size = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).size(path);
        return result;
    };

    FlatOS.System.FS.prototype.sizeInOctets = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).sizeInOctets(path);
        return result;
    };

    FlatOS.System.FS.prototype.mimetype = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).mimetype(path);
        return result;
    };

    FlatOS.System.FS.prototype.isBinary = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).isBinary(path);
        return result;
    };

    FlatOS.System.FS.prototype.pathInfo = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).pathInfo(path);
        return result;
    };

    FlatOS.System.FS.prototype.readDir = function(path, recursive, options) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).readDir(path, recursive, options);
        return result;
    };

    FlatOS.System.FS.prototype.isRemote = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).isRemote(path);
        return result;
    };

    FlatOS.System.FS.prototype.removeHostFromPath = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).removeHostFromPath(path);
        return result;
    };

    FlatOS.System.FS.prototype.toInternalPath = function (path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).toInternalPath(path);
        return result;
    };

    FlatOS.System.FS.prototype.toExternalPath = function (path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).toExternalPath(path);
        return result;
    };

    FlatOS.System.FS.prototype.toFilesystemPath = function(path) {
        var result;
        new FlatOS.Api.FS(function(r) {
            result = r;
        }).toFilesystemPath(path);
        return result;
    };

}(jQuery);