module.exports = function(grunt) {
	grunt.initConfig({
		babel: {
			options: {
				presets: ['es2015']
			},
			dist: {
				files: {}
			}
		},
		uglify: {
			options: {
				screwIE8: true,
				preserveComments: false,
				report: 'gzip'
			},
			dist: {
				files: {
					'./lib/yapjax.min.js': './lib/yapjax.js'
				}
			}
		},
		esformatter:{
			src: ['src/**/*.js','test/**/*.js'],
			options:{
				indent:{
					value:'\t'
				}
			}
		},
		browserify: {
			options: {
				browserifyOptions: {
					fullPaths: false
				}
			},
			dist: {
				files: {
					'./lib/yapjax.js': './lib/index.js'
				}
			}
		},
		jsdoc: {
			dist: {
				src: ['src/**/*.js', 'README.md'],
				options: {
					destination: 'doc',
					configure: '.jsdoc.json'
				}
			}
		},
		esteWatch: {
			options: {
				dirs: ['src/**/'],
				livereload: {
					enable: false
				},
				ignoredFiles: ['*4913', '*.swp', '*.swx', '*~']
			},
			js: function(path) {
				var files = {};
				files[path.replace('src', 'lib')] = path;
				grunt.config(['babel', 'dist', 'files'], files);
				return 'babel';
			}
		}
	});

	grunt.loadNpmTasks('grunt-este-watch');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-esformatter');

	grunt.registerTask('default', ['esteWatch']);
	grunt.registerTask('doc', ['jsdoc']);
	grunt.registerTask('bundle', ['browserify', 'uglify']);
	grunt.registerTask('fmt',['esformatter']);
};
