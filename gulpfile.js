var fs = require('fs');
var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var concat_css = require('gulp-concat-css');
var concat_js = require('gulp-concat');
var minify_css = require('gulp-cssnano');
var less = require('gulp-less');
var jshint = require('gulp-jshint');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var minify_js = require("gulp-uglify");
var duration = require('gulp-duration');
var mkdirp = require('mkdirp');
var jsdoc = require('gulp-jsdoc');
var adminlteRoot = 'node_modules/admin-lte/';
var cleancss = new LessPluginCleanCSS({ advanced: true });
var sass = require('gulp-sass');
var rename = require('gulp-rename');

var usageCmd = '\nUsage: gulp build|release|docs|install [--local] [--dest]\n \
\t--local\tUse fake data instead of retrieving them from the server.\n \
\t--dest\tSet the destination folder for the install task.\n\
\tbuild\tSimply build the project.\n\
\trelease\tBuild the project with minify and uglify.\n\
\tdocs\tBuild the javascript documentation.\n\
\tinstall\tBuild the project and then copy all the files to the folder specified with --dest.\n\
';

var argv = require('yargs')
    .usage(usageCmd)
    .argv;

var cssSources = [ "node_modules/ionicons/dist/css/ionicons.css",
		   "node_modules/font-awesome/css/font-awesome.css",
		   "node_modules/codemirror/lib/codemirror.css",
		   "node_modules/codemirror/addon/lint/lint.css",
		   "node_modules/bootstrap/dist/css/bootstrap.css",
		   "node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css",
		   "node_modules/bootstrap-daterangepicker/daterangepicker.css",
		   "node_modules/nvd3/build/nv.d3.css",
		   "node_modules/datatables.net-bs/css/dataTables.bootstrap.css",
		   "lib/Styles/*.css"];

var scssSources = ["app/assets/scss/src/**/*.scss"];

var localJSSources = [ "app/app.js",
		       "app/components/dashboard/*.js",
		       "app/components/topbar/*.js",
		       "app/components/kpis/*.js",
		       "app/components/pipes/*.js",
		       "app/components/widgets/*.js",
		       "app/components/services/*.js",
		       "app/components/indicators/*.js",
		       "app/components/settings/*.js",
		       "app/components/modules/*.js",
		       "lib/js/*.js" ];

localJSSources.push(argv.local ? "app/components/configuration/conf_debug.js" : "app/components/configuration/conf.js");

var externalJSSources = [ 'node_modules/moment/moment.js',
			  'node_modules/moment-timezone/builds/moment-timezone-with-data.js',
			  'node_modules/lodash/lodash.js',
			  'node_modules/jquery/dist/jquery.js',
			  'node_modules/datatables.net/js/jquery.dataTables.js',
			  'node_modules/jshint/dist/jshint.js',
			  'node_modules/codemirror/lib/codemirror.js',
			  'node_modules/codemirror/mode/javascript/javascript.js',
			  //'node_modules/codemirror/addon/hint/show-hint.js',
			  'node_modules/codemirror/addon/edit/matchbrackets.js',
			  'node_modules/codemirror/addon/edit/closebrackets.js',
			  'node_modules/codemirror/addon/lint/lint.js',
			  'node_modules/jsonlint/lib/jsonlint.js',
			  'node_modules/codemirror/addon/lint/javascript-lint.js',
			  'node_modules/codemirror/addon/lint/json-lint.js',
			  'node_modules/angular/angular.js',
			  'node_modules/angular-route/angular-route.js',
			  'node_modules/angular-resource/angular-resource.js',
			  'node_modules/angular-datatables/dist/angular-datatables.js',
			  'node_modules/bootstrap/dist/js/bootstrap.js',
			  'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
			  'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
			  'node_modules/bootstrap-daterangepicker/daterangepicker.js',
			  'node_modules/angular-daterangepicker/js/angular-daterangepicker.js',
			  'node_modules/d3/d3.js',
			  'node_modules/nvd3/build/nv.d3.js',
			  'node_modules/angular-nvd3/dist/angular-nvd3.js',
			  'node_modules/fastclick/lib/fastclick.js',
			  'node_modules/datatables.net-bs/js/dataTables.bootstrap.js',
			  'node_modules/angular-ui-codemirror/src/ui-codemirror.js'
			  ];

var jsSources = externalJSSources.concat(localJSSources);

mkdirp('docs');
mkdirp('wwwroot/build/fonts');
mkdirp('wwwroot/build/js');
mkdirp('wwwroot/build/css');
mkdirp('wwwroot/build/html');
mkdirp('wwwroot/build/img');

gulp.task('default', function() {
    console.log(usageCmd);
});

gulp.task('install', gulpSequence('build', 'copy-files'));

gulp.task('build', [ 'common', 'prepare-css', 'prepare-js' ]);

gulp.task('release', ['common', 'prepare-css-release', 'prepare-js-release' ]);

gulp.task('common', [ 'lint', 'prepare-assets', 'prepare-html' ]);

gulp.task('docs', function() {
    return gulp.src(localJSSources.concat(['README.md']))
	.pipe(jsdoc('./docs'));
});

gulp.task('lint', function() {
    return gulp.src(localJSSources)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('prepare-html', function() {
    return gulp.src([ "app/components/dashboard/*.html",
		      "app/components/topbar/*.html",
		      "app/components/settings/*.html",
		      "app/components/widgets/*.html"
		    ])
	.pipe(duration('Execution Time: '))
	.pipe(gulp.dest('wwwroot/build/html/'));
});

gulp.task('prepare-assets', function() {
    return gulp.src([ "node_modules/ionicons/dist/fonts/ionicons*",
		      "node_modules/bootstrap/dist/fonts/glyphicons*",
		      "node_modules/font-awesome/fonts/fontawesome*" ])
	.pipe(duration('Execution Time: '))
	.pipe(gulp.dest('wwwroot/build/fonts/'));
});

function buildCSS(cssFiles, scssFiles, minify) {

    // Compile scss sources first
   gulp.src(scssFiles)
        .pipe(sass().on('error', sass.logError))
        .pipe(rename("compiled_main.css"))
        .pipe(gulp.dest('app/assets/scss/build'))
        .pipe(duration('Execution Time: '));

    // Merge with external css sources
    var sources = cssFiles.concat(["app/assets/scss/build/compiled_main.css"]);
    var g = gulp.src(sources)
	.pipe(concat_css('style.min.css',
			 { rebaseUrls: false }));
    if(minify) {
	g = g.pipe(minify_css({zindex: false}));
    }

    return  g.pipe(duration('Execution Time: '))
	.pipe(gulp.dest('wwwroot/build/css/'));
}

function buildJS(files, destName, destDir, minify) {
    var g = gulp.src(files)
	.pipe(concat_js(destName));
    if(minify) {
	g = g.pipe(minify_js());
    }
    return g.pipe(duration('Execution Time: '))
	.pipe(gulp.dest(destDir));
}

gulp.task('prepare-js', function() {
    return buildJS(jsSources, 'lib.min.js', 'wwwroot/build/js/', false);
});

gulp.task('prepare-js-release', function() {
    return buildJS(jsSources, 'lib.min.js', 'wwwroot/build/js/', true);
});

gulp.task('prepare-css', function() {
    return buildCSS(cssSources, scssSources, false);
});

gulp.task('prepare-css-release', function() {
    return buildCSS(cssSources, scssSources, true);
});

gulp.task('copy-files', function() {
	if(!argv.dest)
		throw "Missing destination path; use --dest parameter to indicate the destination folder";

	return gulp.src("wwwroot/**/*")
		.pipe(gulp.dest(argv.dest));
});
