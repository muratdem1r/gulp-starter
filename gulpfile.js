"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const prefix = require("gulp-autoprefixer");
const minify = require("gulp-clean-css");
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
      // 1. where is my scss file
      .src("./src/sass/**/*.scss")
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

// optimize images
function image() {
  return (
    gulp
      // 1. where is my images
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
  gulp.watch("./src/sass/**/*.scss", style);
  gulp.watch("./*.html").on("change", browserSync.reload);
  gulp.watch("./src/img/**/*.{jpg,png}", gulp.series(image, webp));
  gulp.watch("./js/**/*.js").on("change", browserSync.reload);
}

/**
 * Run "gulp build" for build changes
 *
 * !! You have to run this once
 */
exports.build = gulp.series(build, style, image, webp);

// call "gulp" for watching changes
exports.default = gulp.series(style, image, webp, watch);
