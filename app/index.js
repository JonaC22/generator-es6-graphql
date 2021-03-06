'use strict';
var generator = require('yeoman-generator');
var chalk = require('chalk');
var crypto = require('crypto');

module.exports = generator.Base.extend({
  initializing: function() {
    this.auth = [];
    this.authLocal = false;
  },

  prompting: {
    appname: function() {
      var done = this.async();
      this.prompt({
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: this.appname
      }).then((answers) => {
        this.appname = answers.name;

        done();
      });
    },

    graphqlroute: function() {
      var done = this.async();
      this.prompt({
        type: 'input',
        name: 'graphqlroute',
        message: 'Route to the GraphQL endpoint',
        default: '/graphql'
      }).then((answers) => {
        this.graphqlroute = answers.graphqlroute;
        if(this.graphqlroute[0] != '/') {
          this.graphqlroute = '/' + this.graphqlroute;
        }

        done();
      });
    },

    graphiql: function() {
      var done = this.async();
      this.prompt({
        type: 'confirm',
        name: 'graphiql',
        message: 'Enable GraphiQL',
        default: true
      }).then((answers) => {
        this.graphiql = answers.graphiql;

        done();
      });
    },

    database: function() {
      var done = this.async();
      this.prompt({
        type: 'list',
        name: 'database',
        message: 'Choose database',
        choices: [
          {name: 'Mongoose', value: 'mongoose'},
          {name: 'None', value: 'none'}
        ],
        default: 0
      }).then((answers) => {
        this.database = answers.database;

        if(this.database != 'none') {
          this.prompt({
            type: 'input',
            name: 'name',
            message: 'Database name',
            default: this.appname
          }).then((answers) => {
            this.databaseName = answers.name;

            done();
          });
        }
        else {
          done();
        }
      });
    },

    passport: function() {
      var done = this.async();
      this.prompt({
        type: 'confirm',
        name: 'authentication',
        message: 'Enable passport for authentication',
        default: true
      }).then((answers) => {
        this.authentication = answers.authentication;
        this.secret = crypto.randomBytes(16).toString('hex')

        done();
      });
    },

    local: function() {
      var done = this.async();
      if(this.authentication && this.database !== 'none') {
        this.prompt({
          type: 'confirm',
          name: 'authLocal',
          message: 'Enable local authentication strategy',
          default: true
        }).then((answers) => {
          this.authLocal = answers.authLocal;

          done();
        });
      }
      else {
        done();
      }
    },

    strategies: function() {
      var done = this.async();
      if(this.authentication) {
        this.authFull = [];

        var choices = [
          { name: 'Facebook', value: 'passport-facebook', slug: 'facebook' },
          { name: 'Github', value: 'passport-github', slug: 'github' },
          { name: 'Google', value: 'passport-google-oauth', slug: 'google' },
          //{name: 'Twitter', value: 'passport-twitter'}
        ];

        this.prompt({
          type: 'checkbox',
          name: 'auth',
          message: 'Choose OAuth strategies',
          choices: choices,
          default: []
        }).then((answers) => {
          this.auth = answers.auth;

          choices.map((item) => {
            if(this.auth.indexOf(item.value) > -1) {
              this.authFull.push({
                npm: item.value,
                name: item.name,
                slug: item.slug
              });
            }
          });

          done();
        });
      }
      else {
        done();
      }
    },
  },

  writing: {
    yorc: function() {
      this.config.save();
    },

    projectfiles: function() {
      this.copy('.babelrc', '.babelrc');
      this.copy('.eslintrc', '.eslintrc');
      this.copy('.travis.yml', '.travis.yml');
      this.template('_package.json', 'package.json');
      this.template('_README.md', 'README.md');
    },

    gitfiles: function() {
      this.copy('gitignore', '.gitignore');
    },

    app: function() {
      this.template('src/_server.js', 'src/server.js');
      this.template('src/config/_main.json', 'src/config/main.json');
      this.copy('public/.placeholder', 'public/.placeholder');
    },

    tools: function() {
      this.copy('tools/lib/copy.js', 'tools/lib/copy.js');
      this.copy('tools/lib/watch.js', 'tools/lib/watch.js');
      this.copy('tools/build.js', 'tools/build.js');
      this.copy('tools/bundle.js', 'tools/bundle.js');
      this.copy('tools/clean.js', 'tools/clean.js');
      this.copy('tools/config.js', 'tools/config.js');
      this.copy('tools/copy.js', 'tools/copy.js');
      this.copy('tools/serve.js', 'tools/serve.js');
      this.copy('tools/start.js', 'tools/start.js');
    },

    lib: function() {
      this.copy('src/lib/items.js', 'src/lib/items.js');
      if(this.authLocal) {
        this.copy('src/lib/users.js', 'src/lib/users.js');
      }
    },

    schema: function() {
      this.copy('src/schema/items.js', 'src/schema/items.js');
      this.template('src/schema/_index.js', 'src/schema/index.js');
      if(this.authLocal) {
        this.copy('src/schema/users.js', 'src/schema/users.js');
      }
    },

    models: function() {
      if(this.database === 'mongoose') {
        this.copy('src/models/.placeholder', 'src/models/.placeholder');
      }

      if(this.authLocal) {
        this.copy('src/models/User.js', 'src/models/User.js');
      }
    },

    authentication: function() {
      if(this.authentication) {
        this.template('src/_passport.js', 'src/passport.js');

        if(this.auth.length > 0) {
          this.template('src/config/_passport.json', 'src/config/passport.json');
        }
      }
    }
  },

  install: function() {
    this.npmInstall([
      'babel',
      'express',
      'express-graphql',
      'graphql',
      'source-map-support',
      'webpack'
    ], {'save': true});

    this.npmInstall([
      'babel-core',
      'babel-polyfill',
      'babel-cli',
      'babel-eslint',
      'babel-loader',
      'babel-preset-es2015',
      'babel-preset-stage-1',
      'del',
      'eslint',
      'gaze',
      'json-loader',
      'lodash.merge',
      'mkdirp',
      'ncp',
      'path',
      'replace',
    ], {'saveDev': true});

    if(this.database === 'mongoose') {
      this.npmInstall(['mongoose', 'connect-mongo'], {'save': true});
    }

    if(this.authentication) {
      this.npmInstall(['passport', 'express-session'], {'save': true});
      this.npmInstall(this.auth, {'save': true});
    }

    if(this.authLocal) {
      this.npmInstall([
        'passport-local',
        'body-parser',
        'bcrypt',
        'graphql-custom-types'
      ], {'save': true});
    }
  },

  end: {
    finished: function() {
      this.log(chalk.bold.green('\nGenerator setup finished.'));
      if(this.auth.length > 0) {
        this.log(chalk.bold.white('Do not forget to add your API credentials to src/config/passport.json'));
      }
      this.log('If you see no errors above, run the server:');
      this.log(chalk.bold.white('npm start'));
    }
  }
});
