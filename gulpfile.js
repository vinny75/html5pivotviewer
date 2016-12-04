var gulp = require('gulp');
var concat = require('gulp-concat');  
var rename = require('gulp-rename');  
var uglify = require('gulp-uglify');

var src = [
	'./src/namespaces.js',
	'./src/pubsub.js',
	'./src/utils.js',
	'./src/models.js',
	'./src/collectionloader.js',
	'./src/jsonloader.js',
	'./src/views/ipivotviewerview.js',
	'./src/views/tilebasedview.js',
	'./src/views/dataview.js',
	'./src/views/graphview.js',
	'./src/views/gridview.js',
	'./src/views/iimagecontroller.js',
	'./src/views/LoadImageSetHelper.js',
	'./src/views/mapview.js',
	'./src/views/mapview2.js',
	'./src/views/timeview.js',
	'./src/views/tableview.js',
	'./src/views/tilecontroller.js',
	'./src/views/deepzoom.js',
	'./src/views/simpleimage.js',
	'./src/pivotviewer.js'
];

var dest = './dist/js';

gulp.task('scripts', function() {  
    return gulp.src(src)
        .pipe(concat('pivotviewer.js'))
        .pipe(gulp.dest(dest))
        .pipe(rename('pivotviewer.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dest));		
});

gulp.task('serve', function () {
var express = require('express'); 
	var serveStatic = require('serve-static'); 
	var app = express(); 
	app.use(serveStatic(__dirname)); 
	app.listen(3000); 
});

gulp.task('default', ['scripts']);