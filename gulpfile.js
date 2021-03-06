var gulp = require('gulp');
var concat = require('gulp-concat');  
var rename = require('gulp-rename');  
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var imagemin = require('gulp-imagemin');
var eslint = require('gulp-eslint');
var fs = require('fs');
var reporter = require('eslint-html-reporter');
var beautify = require('gulp-beautify');
var stripDebug = require('gulp-strip-debug');
 
var jsSrc = [
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
	/*'./src/views/mapview.js',
	'./src/views/mapview2.js',
	'./src/views/timeview.js',*/
	'./src/views/tableview.js',
	'./src/views/tilecontroller.js',
	'./src/views/deepzoom.js',
	'./src/views/simpleimage.js',
	'./src/pivotviewer.js'
];

var jsDest = './dist/js';

var cssSrc = [
	'./style/pivotviewer.css',
	'./style/jquery-ui.overrides.css'
];

var cssDest = './dist/css';

var imgDest = './dist/images';

gulp.task('scripts', function() {  
    return gulp.src(jsSrc)
        .pipe(concat('pivotviewer.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('pivotviewer.min.js'))
		.pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));		
});

gulp.task('style', function() {  
    return gulp.src(cssSrc)
        .pipe(concat('pivotviewer.css'))
        .pipe(gulp.dest(cssDest))
        .pipe(rename('pivotviewer.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest(cssDest));		
});

gulp.task('images', function() {  
    return gulp.src('./images/*')
        .pipe(imagemin())
        .pipe(gulp.dest(imgDest));		
});

gulp.task('lint', function() {
	return gulp.src(jsSrc)
		.pipe(eslint())
		.pipe(eslint.format(reporter, fs.createWriteStream('./eslint-report.html')))
		.pipe(eslint.failAfterError());
});

gulp.task('beautify', function() {
  gulp.src(jsSrc)
    .pipe(beautify())
    .pipe(gulp.dest('./clean'))
});

gulp.task('serve', function () {
var express = require('express'); 
	var serveStatic = require('serve-static'); 
	var app = express(); 
	app.use(serveStatic(__dirname)); 
	app.listen(3000); 
	
	gulp.watch('./src/**/*.js', ['scripts']);
	gulp.watch('./style/*.css', ['style']);
});

gulp.task('default', ['scripts', 'style', 'images']);