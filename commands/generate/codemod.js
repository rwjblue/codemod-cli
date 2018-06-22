import { stripIndent } from 'common-tags';

export const command = 'codemod <codemod-name>';
export const desc = 'Generate a new codemod file';

export function builder(yargs) {
  yargs.positional('codemod-name', {
    describe: 'the name of the codemod to generate',
  });
}

export function handler(options) {
  let { codemodName } = options;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  const fs = require('fs-extra');

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
}
