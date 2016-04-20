const gulp = require('gulp')
const babel = require('gulp-babel')

gulp.task('compile', () => {
	console.log('test')
    return gulp.src('src/**/.js')
           .pipe(babel({
               presets: ['es2015']
           }))
          .pipe(gulp.dest('dist'))
})

gulp.watch('src/**/*.js', ['compile'])