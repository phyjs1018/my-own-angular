const gulp = require('gulp')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const Server = require( 'karma' ).Server

// gulp.task('compile', () => {
//   return gulp.src('src/**/*.js')
//   .pipe(concat('all.js'))
//   .pipe(babel({
//     presets: ['es2015']
//   }))
//   .pipe(gulp.dest('dist'))
// })

// gulp.watch('src/**/*.js', ['compile'])
gulp.task('concat', () => {
  return gulp.src('src/**/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist'))
})

gulp.task( 'test', ['concat'], function ( done ) {
  new Server( {
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  }, function () {
    done()
  } ).start()
} )

gulp.watch('src/**/*.js', ['test'])