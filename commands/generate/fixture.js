'use strict';

module.exports = {
  command: 'fixture <codemod-name> <fixture-name>',
  desc: 'Generate a new codemod file or a fixture for an existing codemod',
  builder: yargs => {
    yargs
      .positional('codemod-name', {
        describe: 'the name of the codemod the fixture is for',
      })
      .positional('fixture-name', {
        describe: 'the name of the fixture to generate',
      });
  },
  handler: function(options) {
    let { codemodName, fixtureName } = options;
    let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

    const fs = require('fs-extra');

    let fixturePath = `${codemodDir}/__test_fixtures__/${fixtureName}`;

    fs.ensureFileSync(`${fixturePath}.input.js`, '');
    fs.ensureFileSync(`${fixturePath}.output.js`, '');
  },
};
