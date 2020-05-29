'use strict';

/* global expect, it, describe, beforeEach, afterEach */

const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const { transformDetails } = require('./utils');

function runTemplateTest(transformFn, input, expectedOutput) {
  const { transform } = require('ember-template-recast');

  let { code } = transform(input, transformFn);

  expect((code || '').trim()).toEqual(expectedOutput.trim());
}

module.exports = function templateTest(options) {
  let details = transformDetails(options);

  let transform = require(details.transformPath);

  describe(details.name, function() {
    globby
      .sync('**/*.input.*', {
        cwd: details.fixtureDir,
        absolute: true,
      })
      .map(entry => entry.slice(entry.indexOf('__testfixtures__') + '__testfixtures__'.length + 1))
      .forEach(filename => {
        let extension = path.extname(filename);
        let testName = filename.replace(`.input${extension}`, '');
        let inputPath = path.join(details.fixtureDir, `${testName}.input${extension}`);
        let outputPath = path.join(details.fixtureDir, `${testName}.output${extension}`);
        let optionsPath = path.join(details.fixtureDir, `${testName}.options.json`);
        let options = fs.pathExistsSync(optionsPath) ? fs.readFileSync(optionsPath) : '{}';

        describe(testName, function() {
          beforeEach(function() {
            process.env.CODEMOD_CLI_ARGS = options;
          });

          afterEach(function() {
            process.env.CODEMOD_CLI_ARGS = '';
          });

          it('transforms correctly', function() {
            runTemplateTest(
              transform,
              fs.readFileSync(inputPath, 'utf8'),
              fs.readFileSync(outputPath, 'utf8')
            );
          });

          it('is idempotent', function() {
            runTemplateTest(
              transform,
              fs.readFileSync(outputPath, 'utf8'),
              fs.readFileSync(outputPath, 'utf8')
            );
          });
        });
      });
  });
};
