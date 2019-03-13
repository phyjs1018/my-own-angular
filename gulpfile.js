const gulp = require('gulp')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const Server = require( 'karma' ).Server

gulp.task('compile', () => {
  return gulp.src('src/**/*.js')
  .pipe(concat('all.js'))
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(gulp.dest('dist'))
})

gulp.task('test', ['compile'], function ( done ) {
  new Server( {
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  }, function () {
    done()
  } ).start()
} )

gulp.watch('src/**/*.js', ['test'])