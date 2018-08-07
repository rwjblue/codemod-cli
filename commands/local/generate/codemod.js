module.exports.command = 'codemod <codemod-name>';
module.exports.desc = 'Generate a new codemod file';

module.exports.builder = function builder(yargs) {
  yargs.positional('codemod-name', {
    describe: 'the name of the codemod to generate',
  });
};

module.exports.handler = function handler(options) {
  const fs = require('fs-extra');
  const { stripIndent } = require('common-tags');
  const importCwd = require('import-cwd');
  const generateFixture = require('./fixture').handler;

  let { codemodName } = options;
  let projectName = importCwd('./package.json').name;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  fs.outputFileSync(
    `${codemodDir}/index.js`,
    stripIndent`
      const { getParser } = require('codemod-cli').jscodeshift;
      const { getOptions } = require('codemod-cli');

      module.exports = function transformer(file, api) {
        const j = getParser(api);
        const options = getOptions();

        return j(file.source)
          .find(j.Identifier)
          .forEach(path => {
            path.node.name = path.node.name
              .split('')
              .reverse()
              .join('');
          })
          .toSource();
      }
  `,
    'utf8'
  );
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
