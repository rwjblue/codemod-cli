'use strict';

/* global it, describe, beforeEach, afterEach */

const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const { transformDetails } = require('./test-support/utils');

function testRunner(options, runTest) {
  let details = transformDetails(options);

  let transform = require(details.transformPath);

  describe(details.name, function () {
    globby
      .sync('**/*.input.*', {
        cwd: details.fixtureDir,
        absolute: true,
      })
      .map((entry) =>
        entry.slice(entry.indexOf('__testfixtures__') + '__testfixtures__'.length + 1)
      )
      .forEach((filename) => {
        let extension = path.extname(filename);
        let testName = filename.replace(`.input${extension}`, '');
        let testInputPath = path.join(details.fixtureDir, `${testName}${extension}`);
        let inputPath = path.join(details.fixtureDir, `${testName}.input${extension}`);
        let outputPath = path.join(details.fixtureDir, `${testName}.output${extension}`);
        let optionsPath = path.join(details.fixtureDir, `${testName}.options.json`);
        let options = fs.pathExistsSync(optionsPath) ? fs.readFileSync(optionsPath) : '{}';

        describe(testName, function () {
          beforeEach(function () {
            process.env.CODEMOD_CLI_ARGS = options;
          });

          afterEach(function () {
            process.env.CODEMOD_CLI_ARGS = '';
          });

          it('transforms correctly', function () {
            runTest(
              transform,
              { path: testInputPath, source: fs.readFileSync(inputPath, 'utf8') },
              fs.readFileSync(outputPath, 'utf8')
            );
          });

          it('is idempotent', function () {
            runTest(
              transform,
              { path: testInputPath, source: fs.readFileSync(outputPath, 'utf8') },
              fs.readFileSync(outputPath, 'utf8')
            );
          });
        });
      });
  });
}

function runTransformTest(options) {
  let details = transformDetails(options);

  switch (details.transformType) {
    case 'js':
      return testRunner(options, require('./test-support/jscodeshift'));
    case 'hbs':
      return testRunner(options, require('./test-support/template'));
    default:
      throw new Error(`Unknown type of transform: "${details.transformType}"`);
  }
}

module.exports = {
  runTransformTest,
};
