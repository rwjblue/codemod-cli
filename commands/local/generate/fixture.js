module.exports.command = 'fixture <codemod-name> <fixture-name>';
module.exports.desc = 'Generate a new codemod file or a fixture for an existing codemod';

module.exports.builder = function builder(yargs) {
  yargs
    .positional('codemod-name', {
      describe: 'the name of the codemod the fixture is for',
    })
    .positional('fixture-name', {
      describe: 'the name of the fixture to generate',
    })
    .option('codemod-dir', {
      type: 'string',
      describe: 'the path to the transform directory',
      default: `./transforms/`,
    });
};

module.exports.handler = function handler(options) {
  const fs = require('fs-extra');
  const path = require('path');
  const { getTransformType } = require('../../../src/transform-support');

  let { codemodName, fixtureName } = options;
  let codemodDir = path.resolve(process.cwd(), path.join(options.codemodDir, codemodName));
  let fixturePath = `${codemodDir}/__testfixtures__/${fixtureName}`;

  let transformType = getTransformType(codemodDir);

  fs.outputFileSync(`${fixturePath}.input.${transformType}`, '');
  fs.outputFileSync(`${fixturePath}.output.${transformType}`, '');
};
