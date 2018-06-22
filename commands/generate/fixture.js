export const command = 'fixture <codemod-name> <fixture-name>';
export const desc = 'Generate a new codemod file or a fixture for an existing codemod';

export function builder(yargs) {
  yargs
    .positional('codemod-name', {
      describe: 'the name of the codemod the fixture is for',
    })
    .positional('fixture-name', {
      describe: 'the name of the fixture to generate',
    });
}

export function handler(options) {
  let { codemodName, fixtureName } = options;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  const fs = require('fs-extra');

  let fixturePath = `${codemodDir}/__test_fixtures__/${fixtureName}`;

  fs.outputFileSync(`${fixturePath}.input.js`, '');
  fs.outputFileSync(`${fixturePath}.output.js`, '');
}
