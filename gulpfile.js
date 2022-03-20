"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const prefix = require("gulp-autoprefixer");
const minify = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const terser = require("gulp-terser");
const concat = require("gulp-concat");
const imagewebp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync").create();

// creating src folders
function build() {
  return gulp
    .src("*.*", { read: false })
    .pipe(gulp.dest("./src"))
    .pipe(gulp.dest("./src/sass"))
    .pipe(gulp.dest("./src/img"))
    .pipe(gulp.dest("./src/js"));
}

// compile scss into css
function style() {
  return (
    gulp
      // 1. where are my scss files
      .src("./src/sass/**/*.{scss,sass}")
      // 2. pass that file through sass compiler
      .pipe(sass().on("error", sass.logError))
      // 3. prefix compiler
      .pipe(prefix())
      // 4. minify compiler
      .pipe(minify())
      // 5. where do I save the compiled css?
      .pipe(gulp.dest("./css"))
      // 6. stream changes to all browser
      .pipe(browserSync.stream())
  );
}

// minify JS files
function js() {
  return (
    gulp
      // 1. where are my js files
      .src("./src/js/**/*.js")
      // 2. sourcemaps init
      .pipe(sourcemaps.init())
      // 3. compressed es6+ code
      .pipe(terser())
      // 4. concatenates files to main
      .pipe(concat("main.js"))
      // 5. sourcemaps where to write
      .pipe(sourcemaps.write("./"))
      // 6. where do I save the minified js?
      .pipe(gulp.dest("./js"))
      // 7. stream changes to all browser
      .pipe(browserSync.stream())
  );
}

// optimize images
function image() {
  return (
    gulp
      // 1. where are my images
      .src("./src/img/**/*.{jpg,png}")
      // 2. pass that images through imagemin optimizer
      .pipe(
        imagemin([
          imagemin.mozjpeg({ quality: 80, progressive: true }),
          imagemin.optipng({ optimizationLevel: 2 }),
        ])
      )
      // 3. where do I save the optimized images?
      .pipe(gulp.dest("./img"))
      // 4. stream changes to all browser
      .pipe(browserSync.stream())
  );
}

//webp images
function webp() {
  return (
    gulp
      // 1. where is my optimized images
      .src("./img/**/*.{jpg,png}")
      // 2. pass that images through imagewebp converter
      .pipe(imagewebp())
      // 3. where do I save the webp files?
      .pipe(gulp.dest("./img"))
      // 4. stream changes to all browser
      .pipe(browserSync.stream())
  );
}

// watching for changes
function watch() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
  gulp.watch("./src/sass/**/*.{scss,sass}", style);
  gulp.watch("./src/js/**/*.js", js);
  gulp.watch("./*.html").on("change", browserSync.reload);
  gulp.watch("./src/img/**/*.{jpg,png}", gulp.series(image, webp));
}

/**
 * Run "gulp build" for build changes
 *
 * !! You have to run this once
 */
exports.build = gulp.series(build, style, js, image, webp);

// call "gulp" for watching changes
exports.default = gulp.series(style, js, image, webp, watch);
