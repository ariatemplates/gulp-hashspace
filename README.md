gulp-hashspace
====================

## Installation

Import `gulp-hashspace` in your `gulpfile.js`:

```javascript
var gulp = require('gulp');
var hsp = require('gulp-hashspace');
```

## Compile

```javascript
gulp.task('default', function() {

    //compile, transpile & copy
    gulp.src('src/**/*.hsp')
        .pipe(hsp.compile())
        .pipe(gulp.dest('dist'));
});
```

Compilation process invokes transpile step internally

## Transpile

```javascript
gulp.task('default', function() {

    //transpile & copy
    gulp.src('src/**/*.js')
        .pipe(hsp.transpile())
        .pipe(gulp.dest('dist'));
});
```