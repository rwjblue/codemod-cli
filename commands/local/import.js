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
  let regex = /https:\/\/astexplorer\.net\/#\/gist\/(\w+)\/(\w+)/;
  let matches = regex.exec(gistUrl);

  let [, gist_id, gistRevision] = matches;

  let rawFile = `https://gist.githubusercontent.com/astexplorer/${gist_id}/raw/${gistRevision}/transform.js`;

  const request = require('request'); // eslint-disable-line
  request.get(rawFile, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      fs.outputFileSync(`${codemodDir}/index.js`, body, 'utf8');
    }
  });

  let projectName = importCwd('./package.json').name;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

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
