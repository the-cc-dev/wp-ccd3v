//var = require('');
var browserSync = require('browser-sync');
var cache       = require('gulp-cache');
var concat      = require('gulp-concat');
var filter      = require('gulp-filter');
var flatten     = require('gulp-flatten');
var gulp        = require('gulp');
var gulpIf      = require('gulp-if');
var imagemin    = require('gulp-imagemin');
var minifyCss   = require('gulp-cssnano');
var minifyJs    = require('gulp-uglify');
var plumber     = require('gulp-plumber');
var rename      = require('gulp-rename');
var runSequence = require('run-sequence');
var sass        = require('gulp-sass');
var wiredep     = require('gulp-wiredep');

var manifest    = require('asset-builder')('./assets/manifest.json');

var path        = manifest.paths,
    config      = manifest.config || {},
    globs       = manifest.globs,
    project     = manifest.getProjectGlobs(),
    
    assets      = {
         fonts: path.source + "fonts/",
        images: path.source + "images/",
            js: path.source + "js/",
           css: path.source + "css/",
          scss: path.source + "scss/"
    },
    mainScss    = assets.scss + "main.scss",
    dist        = {
         fonts: path.dist + "fonts/",
        images: path.dist + "images/",
       scripts: path.dist + "javascripts/",
        styles: path.dist + "stylesheets/"
    },
    bwr = "bower.json",
    man = path.source + "manifest.json";

// Error checking; produce an error rather than crashing.
var onError = function(err) {
  console.log(err.toString());
  this.emit('end');
};

// ## Gulp tasks
// Run `gulp -T` for a task summary

// ### Clean
/*

*/
gulp.task('clean', require('del').bind(null, [
    path.dist + "**/*",
    assets.css + "**/*",
    assets.js + "external.js"
]));

// ### Images
/*

*/
gulp.task('images', function() {
  return gulp.src(globs.images)
    .pipe(plumber({errorHandler: onError}))
    .pipe(cache(imagemin({ 
      optimizationLevel: 3, 
      progressive: true, 
      interlaced: true 
    })))
    .pipe(gulp.dest(dist.images))
    .pipe(browserSync.stream());
});

// ### Fonts
/*

*/
gulp.task('fonts', function() {
  return gulp.src(globs.fonts)
    .pipe(plumber({errorHandler: onError}))
    .pipe(flatten())
    .pipe(gulp.dest(dist.fonts))
    .pipe(browserSync.stream());
});

// ### Bower-SCSS
/*

*/
gulp.task('bower-scss', function() {
  return gulp.src(mainScss)
    .pipe(wiredep())
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(assets.scss));
});

// ### Bower-JS
/*

*/
gulp.task('bower-js', function() {
  var filterJs = filter('**/*.js');
  return gulp.src(globs.bower)
    .pipe(filterJs)
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('external.js'))
    .pipe(gulp.dest(assets.js));
});

// ### Styles
/*
    `gulp styles` - Compiles & optimizes project CSS & Bower CSS
*/
gulp.task('styles', ['bower-scss'], function() {
  return gulp.src(mainScss)
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass())
    .pipe(gulp.dest(assets.css))
    .pipe(minifyCss(), {safe: true})
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest(dist.styles))
    .pipe(browserSync.stream());
});

// ### Scripts
/*
    `gulp scripts` - Compiles, combines, & optimizes project JS & Bower JS
*/
gulp.task('scripts', ['bower-js'], function() {
  return gulp.src(assets.js + "**/*.js")
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat("scripts.js"))
    .pipe(gulp.dest(dist.scripts))
    .pipe(minifyJs())
    .pipe(rename("scripts.min.js"))
    .pipe(gulp.dest(dist.scripts))
    .pipe(browserSync.stream());
});

//  ### Build
/*
    `gulp build` - Run all the build tasks but don't clean up beforehand. 
    Generally you should be running `gulp` instead of `gulp build`.
*/
gulp.task('build', function(callback) {
  runSequence(['fonts', 'images'],
              ['scripts', 'styles'],
              callback);
});

// ### Watch
/*  
    `gulp watch` - Use BrowserSync to proxy your dev server and synchronize 
    code changes across devices. Specify the hostname of your dev server at 
    `manifest.config.devUrl`. When a modification is made to an asset, run the 
    build step for that asset and inject the changes into the page. See: 
    http://www.browsersync.io 
*/
gulp.task('watch', function() {
  browserSync.init({
    files: ["./**/*.php"],
    proxy: config.devUrl,
    snippetOptions: {
      whitelist: ['/wp-admin/admin-ajax.php'],
      blacklist: ['/wp-admin/**']
    }
  });
  gulp.watch([assets.scss   + "**/*.scss"], ['styles']);
  gulp.watch([assets.js     + "**/*.js"],   ['scripts']);
  gulp.watch([assets.fonts  + "**/*"],      ['fonts']);
  gulp.watch([assets.images + "**/*"],      ['images']);
  gulp.watch([bwr, man],                    ['build']);
});

// ### Gulp
/*  
    `gulp` - Run a complete build. 
    To compile for production run `gulp --production`. 
*/
gulp.task('default', ['clean'], function() {
    gulp.start('build');
});