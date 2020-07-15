module.exports.command = 'fixture <codemod-name> <fixture-name>';
module.exports.desc = 'Generate a new codemod file or a fixture for an existing codemod';

module.exports.builder = function builder(yargs) {
  yargs
    .positional('codemod-name', {
      describe: 'the name of the codemod the fixture is for',
    })
    .positional('fixture-name', {
      describe: 'the name of the fixture to generate',
    });
};

module.exports.handler = function handler(options) {
  const fs = require('fs-extra');
  const { getTransformType } = require('../../../src/transform-support');

  let { codemodName, fixtureName } = options;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;
  let fixturePath = `${codemodDir}/__testfixtures__/${fixtureName}`;

  let transformType = getTransformType(codemodDir);

  fs.outputFileSync(`${fixturePath}.input.${transformType}`, '');
  fs.outputFileSync(`${fixturePath}.output.${transformType}`, '');
};
