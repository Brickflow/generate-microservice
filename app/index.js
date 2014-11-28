'use strict';

var path = require('path');
var npmName = require('npm-name');
var generators = require('yeoman-generator');

module.exports = generators.Base.extend({
  init: function() {
    this.log(this.yeoman);
  },

  askForModuleName: function () {
    var done = this.async();

    var prompts = [{
      name: 'name',
      message: 'Module Name',
      default: path.basename(process.cwd()),
    }, {
      type: 'confirm',
      name: 'pkgName',
      message: 'The name above already exists on npm, choose another?',
      default: true,
               when: function(answers) {
                 var done = this.async();

                 npmName(answers.name, function (err, available) {
                   if (!available) {
                     done(true);
                   }

                   done(false);
                 });
               }
    }];

    this.prompt(prompts, function (props) {
      if (props.pkgName) {
        return this.askForModuleName();
      }

      this.slugname = this._.slugify(props.name);
      this.safeSlugname = this.slugname.replace(
          /-+([a-zA-Z0-9])/g,
          function (g) { return g[1].toUpperCase(); }
          );

      done();
    }.bind(this));
  },

  askFor: function () {
    var cb = this.async();

    var prompts = [{
      name: 'description',
      message: 'Description',
      default: 'The best module ever.'
    }, {
      name: 'license',
      message: 'License',
      default: 'ISC'
    }, {
      name: 'githubUsername',
      message: 'GitHub username'
    }, {
      name: 'author',
      message: 'Author',
      default: 'Brickflow'
    }, {
      name: 'keywords',
      message: 'Key your keywords (comma to split)'
    }, {
      type: 'confirm',
      name: 'common',
      message: 'Do you need Brickflow-common?',
      default: false
    }, {
      type: 'confirm',
      name: 'logger',
      message: 'Do you need Brickflow-logger?',
      default: true
    }];

    this.currentYear = (new Date()).getFullYear();

    this.prompt(prompts, function (props) {
      if(props.githubUsername){
        this.repoUrl = 'https://github.com/' + props.githubUsername + 
          '/' + this.slugname;
      } else {
        this.repoUrl = 'user/repo';
      }

      if (!props.homepage) {
        props.homepage = this.repoUrl;
      }

      this.keywords = props.keywords.split(',');

      this.props = props;

      cb();
    }.bind(this));
  },

  app: function () {
      this.config.save();
      this.copy('jshintrc', '.jshintrc');
      this.copy('gitignore', '.gitignore');

      this.template('_README.md', 'README.md');
      this.template('_package.json', 'package.json');
  },

  install: function () {
      this.installDependencies({
          bower: false,
          skipInstall: this.options['skip-install']
      });
  }
});
