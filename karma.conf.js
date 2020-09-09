// Karma configuration
// Generated on Thu May 21 2015 09:01:47 GMT+1000 (AEST)

module.exports = function (config) {

    var sourcePreprocessors = ['coverage'];
    var reporters = ['progress', 'coverage'];

    function isDebug(argument) {
        return argument === '--debug';
    }
    if (process.argv.some(isDebug)) {
        sourcePreprocessors = [];
        reporters = ['progress'];
    }
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        plugins: ['@metahub/karma-jasmine-jquery', 'karma-*'],
        // list of files / patterns to load in the browser
        files: [
            'grails-app/assets/vendor/knockout/3.5.0/knockout.debug.js',
            'grails-app/assets/vendor/knockout/3.5.0/knockout.mapping-latest.js',
            'node_modules/jasmine-ajax/lib/mock-ajax.js',
            'grails-app/assets/vendor/expr-eval/1.2.1/bundle.js',
            'grails-app/assets/vendor/select2/4.0.3/js/select2.full.js',
            'grails-app/assets/vendor/underscorejs/1.8.3/underscore.js',
            'grails-app/assets/vendor/typeahead/0.11.1/bloodhound.js',
            "grails-app/assets/vendor/expr-eval/1.2.1/bundle.js",
            'grails-app/assets/vendor/jquery.validationEngine/jquery.validationEngine.js',
            'grails-app/assets/vendor/jquery.validationEngine/jquery.validationEngine-en.js',
            'grails-app/assets/vendor/momentjs/2.24.0/moment.min.js',
            'grails-app/assets/vendor/momentjs/2.24.0/locales/en-au.js',
            'grails-app/assets/vendor/momentjs/moment-timezone-with-data.min.js',
            'grails-app/assets/javascripts/forms.js',
            'grails-app/assets/javascripts/*.js',
            'grails-app/assets/components/ecodata-components.js',
            'grails-app/assets/components/compile/ecodata-templates.js',
            'grails-app/assets/components/javascript/*.js',
            'test/js/util/*.js',
            'test/js/spec/**/*.js'
        ],

        frameworks: ['jasmine-jquery'],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'grails-app/assets/javascripts/*.js':sourcePreprocessors
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: reporters,

        coverageReporter: {
            'dir':'./target',
            'type':"text",
            check: {
                global: {
                    lines: 34.5
                }
            }
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome','PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
