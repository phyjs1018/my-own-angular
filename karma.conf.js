// Karma configuration
// Generated on Sat Apr 09 2016 09:51:45 GMT+0800 (CST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    plugins: [
      'karma-jasmine',
      // 'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-coverage',
    ],

    // list of files / patterns to load in the browser
    files: [
      './node_modules/lodash/lodash.js',
      './node_modules/jquery/dist/jquery.js',
      './dist/**/*.js',
      './test/**/*.js'
    ],

    // coverage reporter generates the coverage
    reporters: ['progress', 'coverage'],
    
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      './dist/**/*.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      reporters: [
        {type: 'html', dir: 'coverage/'},
        {type: 'text'}
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [/*'PhantomJS'*/'Chrome']
  })
}
