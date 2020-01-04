module.exports.command = 'import <gist-url> <codemod-name>';
module.exports.desc = 'Generate a new codemod file from ast-explorer gist';

module.exports.builder = function builder(yargs) {
  yargs.positional('codemod-name', {
    describe: 'the name of the codemod to generate',
  });
  yargs.positional('gist-url', {
    describe: 'the url of the ast-explorer gist',
  });
};

module.exports.handler = function handler(options) {
  const fs = require('fs-extra');
  const { stripIndent } = require('common-tags');
  const importCwd = require('import-cwd');
  const generateFixture = require('./generate/fixture').handler;
  const { codemodReadme } = require('../../src/readme-support');

  let { codemodName, gistUrl } = options;
  // https://astexplorer.net/#/gist/cb7d2e7ce49741966e5e96a4b2eadc4d/d6b902bf639adc2bc6d31b35ba38aa45910b2413
  let regex = /https:\/\/astexplorer\.net\/#\/gist\/(\w+)\/(\w+)/;
  let matches = regex.exec(gistUrl);

  let [, gist_id] = matches;

  require('dotenv').config();
  const Octokit = require('@octokit/rest');
  const octokit = new Octokit({ auth: process.env.CODEMOD_CLI_API_KEY });
  let projectName = importCwd('./package.json').name;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  octokit.gists
    .get({
      gist_id,
    })
    .then(({ data }) => {
      // TODO: handle error if transform.js is not present
      console.log(data.files);
      fs.outputFileSync(`${codemodDir}/index.js`, data.files['transform.js'].content, 'utf8');
    })
    .catch(err => {
      console.log('Error: ', err);
    });

  fs.outputFileSync(
    `${codemodDir}/test.js`,
    stripIndent`
      'use strict';

      const { runTransformTest } = require('codemod-cli');

      runTransformTest({
        type: 'jscodeshift',
        name: '${codemodName}',
      });
    `,
    'utf8'
  );

  fs.outputFileSync(`${codemodDir}/README.md`, codemodReadme(projectName, codemodName), 'utf-8');
  generateFixture({ codemodName, fixtureName: 'basic' });
};
