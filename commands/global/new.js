'use strict';

module.exports.command = 'new <project-name>';
module.exports.desc = 'Generate a new codemod project';

module.exports.builder = function builder(yargs) {
  yargs.positional('project-name', {
    describe: 'The name of the project to generate',
  });
};

module.exports.handler = function handler(options) {
  let { projectName } = options;

  const fs = require('fs-extra');
  const { stripIndent } = require('common-tags');
  const pkg = require('../../package.json');

  fs.outputFileSync(projectName + '/README.md', `# ${projectName}\n`, 'utf8');
  fs.outputJsonSync(
    projectName + '/package.json',
    {
      name: projectName,
      version: '0.1.0',
      scripts: {
        test: 'codemod-cli test',
      },
      keywords: ['codemod-cli'],
      devDependencies: {
        'codemod-cli': `^${pkg.version}`,
        jest: pkg.devDependencies.jest,
      },
    },
    {
      spaces: 2,
    }
  );
  fs.outputFileSync(
    projectName + '/.travis.yml',
    stripIndent`
      ---
      language: node_js
      node_js:
        - "6"

      sudo: false
      dist: trusty

      cache:
        yarn: true

      before_install:
        - curl -o- -L https://yarnpkg.com/install.sh | bash
        - export PATH=$HOME/.yarn/bin:$PATH

      install:
        - yarn install

      script:
        - yarn test
    `
  );
  fs.ensureFileSync(projectName + '/transforms/.gitkeep');
};
