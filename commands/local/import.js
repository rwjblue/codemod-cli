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

  let { codemodName, gistUrl } = options;
  let gist_id = gistUrl.slice(gistUrl.lastIndexOf('/') + 1);

  const Octokit = require('@octokit/rest');
  const octokit = new Octokit();
  let projectName = importCwd('./package.json').name;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  octokit.gists
    .get({
      gist_id,
    })
    .then(({ data }) => {
      // TODO: handle error if transform.js is not present
      fs.outputFileSync(`${codemodDir}/index.js`, data.files['transform.js'].content, 'utf8');
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
  fs.outputFileSync(
    `${codemodDir}/README.md`,
    stripIndent`
      # ${codemodName}\n

      ## Usage

      \`\`\`
      npx ${projectName} ${codemodName} path/of/files/ or/some**/*glob.js

      # or

      yarn global add ${projectName}
      ${projectName} ${codemodName} path/of/files/ or/some**/*glob.js
      \`\`\`

      ## Input / Output

      <!--FIXTURES_TOC_START-->
      <!--FIXTURES_TOC_END-->

      <!--FIXTURES_CONTENT_START-->
      <!--FIXTURES_CONTENT_END-->
    `,
    'utf8'
  );

  generateFixture({ codemodName, fixtureName: 'basic' });
};
