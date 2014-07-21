'use strict';

var gulp = require('gulp'),
    path = require('path'),
    _ = require('lodash');

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
  images: path.join(bases.app, 'images')
});

// Styles
gulp.task('styles', function () {
  return gulp.src(path.join(bases.styles, 'main.scss'))
    .pipe($.rubySass({
      style: 'compressed',
      // An absolute path is needed for sass to locate the dependencies
      loadPath: [path.join(__dirname, bases.styles),
                 path.join(__dirname, bases.app, 'bower_components')]
    }))
    .pipe($.autoprefixer('last 1 version'))
    .pipe($.chmod(644))
    .pipe(gulp.dest(path.join(bases.static, 'styles')))
    .pipe($.size());
});

// Scripts
gulp.task('scripts', function () {
  return gulp.src(path.join(bases.scripts, 'app.js'))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('default'))
    .pipe($.browserify({
      insertGlobals: true
    }))
    .pipe($.chmod(644))
    .pipe(gulp.dest(path.join(bases.static, 'scripts')))
    .pipe($.size());
});

// React precomiler
gulp.task('jsx', function () {
  return gulp.src(path.join(bases.scripts, '**/*.jsx'))
    .pipe($.react())
    .pipe(gulp.dest(bases.scripts))
    .pipe($.size())
});

// HTML
gulp.task('html', function () {
  return gulp.src(path.join(bases.app, '*.html'))
    .pipe($.useref())
    .pipe($.chmod(644))
    .pipe(gulp.dest(path.join(bases.templates, 'peel')))
    .pipe($.size());
});

// Images
gulp.task('images', function () {
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

// Clean
gulp.task('clean', function () {
  return gulp.src([path.join(bases.static, '*'), path.join(bases.templates, '*')], {read: false})
    .pipe($.rimraf({force: true}))
    .pipe($.print(function(filepath) {
      return "removed: " + filepath;
    }));
});

// Build
gulp.task('build', ['styles', 'scripts', 'html', 'images'], function(){
  return gulp.src(path.join(bases.app, '*.html'))
    .pipe($.useref.assets())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.chmod(644))
    .pipe(gulp.dest('.'));
});

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('json', function() {
  gulp.src(path.join(bases.scripts, '**/*.json', {base: bases.scripts}))
    .pipe(gulp.dest(path.join(bases.static, 'scripts')));
});

// Watch
gulp.task('watch', ['build'], function () {
  // Watch .json files
  gulp.watch(path.join(bases.scripts, '**/*.json'), ['json']);

  // Watch .html files
  gulp.watch(path.join(bases.app, '*.html'), ['html']);

  // Watch .scss files
  gulp.watch(path.join(bases.styles, '**/*.scss'), ['styles']);

  // Watch .jsx files
  gulp.watch(path.join(bases.scripts, '**/*.jsx'), ['jsx']);

  // Watch .js files
  gulp.watch(path.join(bases.scripts, '**/*.js'), ['scripts']);

  // Watch image files
  gulp.watch(path.join(bases.images, '**/*'), ['images']);
});
