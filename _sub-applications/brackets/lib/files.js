"use strict";

function init(srv) {
    var fs = srv.fileSystem;

    function stat(req, callback) {
        fs.resolvePath(req, srv, function (err, path) {
            if (err) {
                return callback({ err: err });
            }

            fs.stat(path, function (err, stats) {
                callback(err ? { err: err } : { stats: stats });
            });
        });
    }

    function readdir(req, callback) {
        fs.resolvePath(req, srv, function (err, path) {
            if (err) {
                return callback({ err: err });
            }

            fs.readdir(path, function (err, files) {
                callback({ err: err, contents: files });
            });
        });
    }

    function mkdir(req, callback) {
        fs.resolvePath(req.path, srv, function (err, path) {
            if (err) {
                return callback(err);
            }

            fs.mkdir(path, req.mode, callback);
        });
    }

    function rename(req, callback) {
        fs.resolvePath(req.oldPath, srv, function (err, oldPath) {
            if (err) {
                return callback(err);
            }
            fs.resolvePath(req.newPath, srv, function (err, newPath) {
                if (err) {
                    return callback(err);
                }

                fs.rename(oldPath, newPath, callback);
            });
        });
    }

    function readFile(req, callback) {
        fs.resolvePath(req.path, srv, function (err, path) {
            if (err) {
                return callback({ err: err });
            }

            fs.readFile(path, req.encoding, function (err, data) {
                callback({ err: err, data: data });
            });
        });
    }

    function writeFile(req, callback) {
        fs.resolvePath(req.path, srv, function (err, path) {
            if (err) {
                return callback(err);
            }

            fs.writeFile(path, req.data, req.encoding, callback);
        });
    }

    function unlink(req, callback) {
        fs.resolvePath(req, srv, function (err, path) {
            if (err) {
                return callback(err);
            }

            fs.unlink(path, callback);
        });
    }

    function moveToTrash(req, callback) {
        fs.resolvePath(req, srv, function (err, path) {
            if (err) {
                return callback(err);
            }

            fs.moveToTrash(path, callback);
        });
    }

    function watchPath(req, callback) {
        fs.resolvePath(req, srv, function (err, path) {
            if (err) {
                return callback(err);
            }

            fs.watchPath(path, callback);
        });
    }

    function unwatchPath(req, callback) {
        fs.resolvePath(req, srv, function (err, path) {
            if (err) {
                return callback(err);
            }

            fs.unwatchPath(path, callback);
        });
    }

    function unwatchAll(req, callback) {
        fs.resolvePath(req, srv, function (err, path) {
            if (err) {
                return callback(err);
            }

            fs.unwatchAll(path, callback);
        });
    }

    function copyFile(req, callback) {
        fs.resolvePath(req.src, srv, function (err, src) {
            if (err) {
                return callback(err);
            }
            fs.resolvePath(req.dest, srv, function (err, dest) {
                if (err) {
                    return callback(err);
                }

                fs.rename(src, dest, callback);
            });
        });
    }


    function watchAllFiles(socket) {

        var path = require('path');
        var fs = require('fs');
        var watch = require('watch');

        // build absolute path to the projects dir
        var absoluteProjectsDir = path.join(process.cwd(), srv.projectsDir);

        // watch files
        watch.watchTree(absoluteProjectsDir, function (f, curr, prev) {

            if (typeof f == "object" && prev === null && curr === null) {
              // Finished walking the tree
            } else if (prev === null) {
              // f is a new file
              socket.emit('created', 'hey')
            } else if (curr.nlink === 0) {
              // f was removed
              socket.emit('removed', 'hey')
            } else {

                console.log('file changed')

              // f was changed
              socket.emit('FILE:change', {
                fname: path.relative(absoluteProjectsDir, f),
                contents: fs.readFileSync(f, {
                  encoding: 'utf8'
                })
              });
            }
        });
    }

    function onConnection (socket) {
        socket.emit("greeting", "hi");

        watchAllFiles(socket)

        socket
            .on("stat", stat)
            .on("mkdir", mkdir)
            .on("readdir", readdir)
            .on("rename", rename)
            .on("readFile", readFile)
            .on("writeFile", writeFile)
            .on("unlink", unlink)
            .on("moveToTrash", moveToTrash)
            .on("watchPath", watchPath)
            .on("unwatchPath", unwatchPath)
            .on("unwatchAll", unwatchAll)
            .on("copyFile", copyFile);
    }

    srv.io
        .of(srv.httpRoot)
        .on("connection", onConnection);
}

exports.init = init;
