var fs = require('fs');
var gulp = require('gulp');
var concatenate = require('gulp-concat-css');
var concat_js = require('gulp-concat');
var minify = require('gulp-cssmin');
var duration = require('gulp-duration');

var adminlteRoot = 'node_modules/admin-lte/';

gulp.task('build', ['prepare-adminlte-css', 'prepare-adminlte-js']);

if(!fs.existsSync('wwwroot/build')) {
    fs.mkdirSync('wwwroot/build');
}

gulp.task('prepare-adminlte-css', function() {
    return gulp.src([ adminlteRoot + "dist/css/AdminLTE.min.css",
		      adminlteRoot + "dist/css/skins/_all-skins.min.css",
		      adminlteRoot + "plugins/iCheck/flat/blue.css",
//		      adminlteRoot + "plugins/morris/morris.css",
//		      adminlteRoot + "plugins/jvectormap/jquery-jvectormap-1.2.2.css" ])
		      adminlteRoot + "plugins/datepicker/datepicker3.css",
		      adminlteRoot + "plugins/daterangepicker/daterangepicker-bs3.css",
		      adminlteRoot + "plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.min.css" ])
    .pipe(concatenate('style.min.css'))
    .pipe(minify())
    .pipe(duration('Execution Time: '))
    .pipe(gulp.dest('wwwroot/build/'));
});

gulp.task('prepare-adminlte-js', function() {
    return gulp.src([ adminlteRoot + 'plugins/jQuery/jQuery-2.1.4.min.js',
		      adminlteRoot + 'plugins/jQueryUI/jquery-ui.min.js',
		      adminlteRoot + 'bootstrap/js/bootstrap.min.js',
		      adminlteRoot + 'plugins/morris/morris.min.js',
		      adminlteRoot + 'plugins/sparkline/jquery.sparkline.min.js',
		      adminlteRoot + 'plugins/jvectormap/jquery-jvectormap-1.2.2.min.js',
		      adminlteRoot + 'plugins/jvectormap/jquery-jvectormap-world-mill-en.js',
		      adminlteRoot + 'plugins/knob/jquery.knob.js',
		      adminlteRoot + 'plugins/daterangepicker/daterangepicker.js',
		      adminlteRoot + 'plugins/datepicker/bootstrap-datepicker.js',
		      adminlteRoot + 'plugins/slimScroll/jquery.slimscroll.min.js',
		      adminlteRoot + 'plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js',
		      adminlteRoot + 'plugins/fastclick/fastclick.js',
		      adminlteRoot + 'dist/js/app.min.js',
		      adminlteRoot + 'dist/js/pages/dashboard.js',
		      adminlteRoot + 'dist/js/demo.js' ])
	.pipe(concat_js('lib.min.js'))
	.pipe(minify())
	.pipe(duration('Execution Time: '))
	.pipe(gulp.dest('wwwroot/build/'));    
});
