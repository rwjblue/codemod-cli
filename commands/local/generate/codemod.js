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
  const generateFixture = require('./fixture').handler;

  let { codemodName } = options;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  fs.outputFileSync(
    `${codemodDir}/index.js`,
    stripIndent`
      module.exports = function transformer(file, api) {
        const j = api.jscodeshift;

        return j(file.source)
          .find(j.Identifier)
          .forEach(path => {
            j(path).replaceWith(
              j.identifier(path.node.name.split('').reverse().join(''))
            );
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
      const transform = require('./index');

      runTransformTest({
        type: 'jscodeshift',
        name: '${codemodName}',
      });
    `,
    'utf8'
  );
  fs.outputFileSync(`${codemodDir}/README.md`, `# ${codemodName}\n`, 'utf8');

  generateFixture({ codemodName, fixtureName: 'basic' });
};
