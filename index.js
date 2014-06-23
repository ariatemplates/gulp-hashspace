var through = require('through2');
var PluginError = require('gulp-util').PluginError;

var hspCompiler = require('hashspace').compiler;
var hspTranspiler = require('hashspace/hsp/transpiler').processString;

module.exports.compile = function() {

    function processHspFile(file, enc, cb){

        if(file.isStream()){
            this.emit('error', new PluginError('gulp-hsp', 'Streaming not supported'));
            return cb();
        }

        if(file.isBuffer()){
            try {
                var compileResult = hspCompiler.compile(String(file.contents), file.path);
                if (!compileResult.errors.length) {
                    file.contents = new Buffer(compileResult.code);
                } else {
                    var err = compileResult.errors[0];
                    var errorMsg = 'Compilation error in "'+ file.path +'" at ' + err.line + ':' + err.column + ': ' + err.description;
                    this.emit('error', new PluginError('gulp-hsp', errorMsg));
                }
            } catch(e) {
                this.emit('error', e);
            }
        }

        this.push(file);
        cb();
    }

    return through.obj(processHspFile);
};


module.exports.transpile = function() {

    function transpileAFile(file, enc, cb) {

        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-hsp-transpiler', 'Streaming not supported'));
            return cb();
        }

        if (file.isBuffer()) {
            try {
                var contentAsString = String(file.contents);
                var transpileResult = {changed: false};

                try {
                    transpileResult = hspTranspiler(contentAsString, file.path);
                } catch (e) {
                    this.emit('error', new PluginError('gulp-hsp',
                        'Transpilation error in "' + file.path + '" at '+ e.line + ':' + e.col + ': ' + e.message), {
                        fileName: file.path,
                        lineNumber: e.line,
                        stack: e.stack
                    });
                }

                if (transpileResult.changed) {
                    file.contents = new Buffer(transpileResult.code);
                }
            } catch (e) {
                this.emit('error', e);
            }
        }

        this.push(file);
        cb();
    }

    return through.obj(transpileAFile);
};
