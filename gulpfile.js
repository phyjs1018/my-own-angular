const gulp = require('gulp')
const babel = require('gulp-babel')
const concat = require('gulp-concat')

gulp.task('compile', () => {
  return gulp.src('src/**/*.js')
  .pipe(concat('all.js'))
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(gulp.dest('dist'))
})

gulp.watch('src/**/*.js', ['compile'])
