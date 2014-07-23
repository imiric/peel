'use strict';

var gulp = require('gulp'),
    path = require('path'),
    _ = require('lodash'),
    bowerFiles = require('main-bower-files');

// Load plugins
var $ = require('gulp-load-plugins')();

// Base directories
var bases = {
  app: 'peel/frontend',
  static: 'static',
  templates: 'peel/templates'
};

_.extend(bases, {
  scripts: path.join(bases.app, 'scripts'),
  styles: path.join(bases.app, 'styles'),
  images: path.join(bases.app, 'images'),
  bower: path.join(bases.app, 'bower_components')
});

// Styles
gulp.task('styles', function() {
  return gulp.src(path.join(bases.styles, 'main.scss'))
    .pipe($.rubySass({
      style: 'compressed',
      // An absolute path is needed for sass to locate the dependencies
      loadPath: [path.join(__dirname, bases.styles),
                 path.join(__dirname, bases.bower)]
    }))
    .pipe($.autoprefixer('last 1 version'))
    .pipe($.chmod(644))
    .pipe(gulp.dest(path.join(bases.static, 'styles')))
    .pipe($.size());
});

// Scripts
gulp.task('browserify:app', function() {
  return gulp.src(path.join(bases.scripts, 'app.js'))
    .pipe($.browserify({
      insertGlobals: true,
      transform: ['reactify', 'debowerify', 'deglobalify']
    }))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('default'))
    .pipe($.uglify())
    .pipe($.chmod(644))
    .pipe(gulp.dest(path.join(bases.static, 'scripts')))
    .pipe($.size());
});

gulp.task('browserify:vendor', function() {
  return gulp.src(bowerFiles(), {base: bases.bower, read: false})
    .pipe($.browserify({
      insertGlobals: false,
      shim: {
        rangy: {
            exports: "rangy",
            init: function() { return this.rangy; },
            path: path.join(bases.bower, 'rangy/rangy-core.js')
        }
      }
    }))
    .pipe($.concat('vendor.js'))
    .pipe($.uglify())
    .pipe($.chmod(644))
    .pipe(gulp.dest(path.join(bases.static, 'scripts')))
    .pipe($.size());
});

gulp.task('scripts', ['browserify:vendor', 'browserify:app']);

// HTML
gulp.task('html', function() {
  return gulp.src(path.join(bases.app, '*.html'))
    .pipe($.useref())
    .pipe($.chmod(644))
    .pipe(gulp.dest(path.join(bases.templates, 'peel')))
    .pipe($.size());
});

// Images
gulp.task('images', function() {
  return gulp.src(path.join(bases.images, '**/*'))
    .pipe($.cache(
      $.imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
      })
    ))
    .pipe(gulp.dest(path.join(bases.static, 'images')))
    .pipe($.size());
});

// Fonts
gulp.task('fonts', function() {
  gulp.src(path.join(bases.bower, 'bootstrap-sass-official', '**/*.{eot,svg,ttf,woff}'), {base: process.cwd()})
    .pipe($.rename({dirname: ''}))
    .pipe(gulp.dest(path.join(bases.static, 'fonts')));
});

// Clean
gulp.task('clean', function() {
  return gulp.src([path.join(bases.static, '*'), path.join(bases.templates, '*')], {read: false})
    .pipe($.rimraf({force: true}))
    .pipe($.print(function(filepath) {
      return "removed: " + filepath;
    }));
});

// Build
gulp.task('build', ['styles', 'scripts', 'html', 'images', 'fonts'], function() {
  return gulp.src(path.join(bases.app, '*.html'))
    .pipe($.useref.assets())
    .pipe($.chmod(644))
    .pipe(gulp.dest('.'));
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('build');
});

gulp.task('json', function() {
  gulp.src(path.join(bases.scripts, '**/*.json', {base: bases.scripts}))
    .pipe(gulp.dest(path.join(bases.static, 'scripts')));
});

// Watch
gulp.task('watch', function() {
  // Watch .json files
  gulp.watch(path.join(bases.scripts, '**/*.json'), ['json']);

  // Watch .html files
  gulp.watch(path.join(bases.app, '*.html'), ['html']);

  // Watch .scss files
  gulp.watch(path.join(bases.styles, '**/*.scss'), ['styles']);

  // Watch .js files
  gulp.watch(path.join(bases.scripts, '**/*.js'), ['browserify:app']);

  // Watch image files
  gulp.watch(path.join(bases.images, '**/*'), ['images']);
});
