var path = require('path');
var through = require('through2');
var PluginError = require('gulp-util').PluginError;

var hspCompiler = require('hashspace').compiler;
var hspTranspiler = require('hashspace/hsp/transpiler').processString;


function compile(file, streamOfFiles) {

    var compileResult = hspCompiler.compile(String(file.contents), file.path);
    if (!compileResult.errors.length) {
        file.contents = new Buffer(compileResult.code);
    } else {
        var err = compileResult.errors[0];
        var errorMsg = 'Compilation error in "'+ file.path +'" at ' + err.line + ':' + err.column + ': ' + err.description;
        streamOfFiles.emit('error', new PluginError('gulp-hsp', errorMsg));
    }

    return file;
}


function transpile(file, streamOfFiles) {

    var contentAsString = String(file.contents);
    var transpileResult = {changed: false};

    try {
        transpileResult = hspTranspiler(contentAsString, file.path);
    } catch (e) {
        streamOfFiles.emit('error', new PluginError('gulp-hsp',
            'Transpilation error in "' + file.path + '" at '+ e.line + ':' + e.col + ': ' + e.message), {
            fileName: file.path,
            lineNumber: e.line,
            stack: e.stack
        });
    }

    if (transpileResult.changed) {
        file.contents = new Buffer(transpileResult.code);
    }

    return file;
}

function gulpTaskFactory(taskToExecute) {

    return function processHspFile(file, enc, cb) {
        if(file.isStream()){
            this.emit('error', new PluginError('gulp-hashspace', 'Streaming not supported'));
            return cb();
        }

        if(file.isBuffer()){
            try {
                this.push(taskToExecute(file, this));
            } catch(e) {
                this.emit('error', e);
            }
        }

        cb();
    }
}

module.exports.compile = function() {
    return through.obj(gulpTaskFactory(compile));
};


module.exports.transpile = function() {
    return through.obj(gulpTaskFactory(transpile));
};

module.exports.process = function() {
    return through.obj(gulpTaskFactory(function(file, streamOfFiles){
        return path.extname(file.path) === '.hsp' ? compile(file, streamOfFiles) : transpile(file, streamOfFiles);
    }));
};