module.exports = function(grunt) {
   var pkgjson = require('./package.json');

   var bowerPath = 'vendor';

   // Configuration
   grunt.initConfig({
      config: {
         version: pkgjson.version,
         name: pkgjson.name,
         pkg: pkgjson,
         project: '.',
         app: 'src',
         css: ['src/css/app.scss'],
         vendor: 'vendor',
         dist: 'dist'
      },
      pkg: this.config.pkg,
      bower: grunt.file.readJSON('./.bowerrc'),
      clean: {
         all: "<%= config.dist %>",
         js: ["<%= config.dist %>/js", "<%= config.dist %>/*.json"]
      },

      requirejs: {
         prod: {
            options: {
               baseUrl: "<%= config.app %>/js",
               mainConfigFile: "<%= config.app %>/main.js",
               include: "main",
               name: "../<%= config.vendor %>/almond/almond",
               optimize: 'uglify2',
               out: "<%= config.dist %>/js/<%= config.name %>.min.js",
               uglify2: {
                  output: {
                     beautify: false,
                     space_colon: false
                  },
                  compress: {
                     sequences: false,
                     booleans: true,
                     unused: true,
                     join_vars: true,
                     global_defs: {
                        DEBUG: false
                     }
                  },
                  warnings: true,
                  mangle: false
               },
               done: function(done, output) {
                  var duplicates = require('rjs-build-analysis').duplicates(output);

                  if (Object.keys(duplicates).length > 0) {
                     grunt.log.subhead('Duplicates found in requirejs build:');

                     for (var key in duplicates) {
                        grunt.log.error(duplicates[key] + ": " + key);
                     }

                     return done(new Error('r.js built duplicate modules, please check the excludes option.'));
                  } else {
                     grunt.log.success("No duplicates found!");
                  }

                  done();
               }
            }
         },
         dev: {
            options: {
               baseUrl: "<%= config.app %>/js",
               mainConfigFile: "<%= config.app %>/js/main.js",
               include: "main",
               name: "../../<%= config.vendor %>/almond/almond",
               optimize : "none",
               out: "<%= config.dist %>/js/<%= config.name %>.dev.js",
               done: function(done, output) {
                  var duplicates = require('rjs-build-analysis').duplicates(output);

                  if (Object.keys(duplicates).length > 0) {
                     grunt.log.subhead('Duplicates found in requirejs build:');

                     for (var key in duplicates) {
                        grunt.log.error(duplicates[key] + ": " + key);
                     }

                     return done(new Error('r.js built duplicate modules, please check the excludes option.'));
                  } else {
                     grunt.log.success("No duplicates found!");
                  }

                  done();
               }
            }
         }
      },

      lintspaces: {
         javascript: {
            src: [
               '<%= config.app %>/js/**/*.js'
            ],
            options: {
               newline: true,
               newlineMaximum: 3,
               trailingspaces: true,
               indentation: 'spaces',
               spaces: 3
            }
         }
      },

      copy: {
         dist: {
            files: [
               {
                  expand: true,
                  cwd: '<%= config.vendor %>',
                  src: 'font-awesome/**/*',
                  dest: '<%= config.dist %>/css'
               },
               {
                  expand: true,
                  cwd: '<%= config.app %>/',
                  src: 'imgs/*',
                  dest: '<%= config.dist %>'
               },
               {
                  expand: true,
                  cwd: '<%= config.app %>',
                  src: 'index.html',
                  dest: '<%= config.dist %>'
               },
               {
                  expand: true,
                  cwd: '<%= config.app %>/js',
                  src: '*.json',
                  dest: '<%= config.dist %>'
               },
               {
                  expand: true,
                  cwd: '<%= config.vendor %>/requirejs',
                  src: '*.js',
                  dest: '<%= config.dist %>/js'
               },
               {
                  expand: true,
                  cwd: '<%= config.app %>/css',
                  src: '*.css',
                  dest: '<%= config.dist %>/css'
               },
               {
                  expand: true,
                  cwd: '<%= config.vendor %>',
                  src: '**/*.css',
                  dest: '<%= config.dist %>/css'
               },
               {
                  expand: true,
                  cwd: '<%= config.app %>',
                  src: 'img/**/*',
                  dest: '<%= config.dist %>'
               }
            ]
         }
      },

      watch: {
         scripts: {
            files: ['<%= config.app %>/js/**/*.js', '<%= config.app %>/style/**/*.scss', '<%= config.app %>/**/*.html', '<%= config.app %>/js/templates/*.hbs'],
            tasks: ['build']
         },
         configFiles: {
            files: ['Gruntfile.js', 'config/*.js'],
            options: {
               reload: true
            }
         }
      }
   });

   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-lintspaces');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-requirejs');

   grunt.registerTask('build', ["clean:all", "requirejs", "copy"]);
   grunt.registerTask('prod', ["clean:all", "requirejs:prod", "copy"]);
   grunt.registerTask('dev', ["clean:all", "requirejs:dev", "copy"]);
   grunt.registerTask('js', ["clean:js", "requirejs:dev", "copy"]);
   grunt.registerTask('devwatch', ["watch"]);
};
