'use strict';

/* global expect, it, describe */

const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const { transformDetails } = require('./utils');
const { transform, parse } = require('ember-template-recast');

function runTemplateTest(plugin, { path: pluginPath, source }, expectedOutput) {
  const code = plugin(
    {
      path: pluginPath,
      source,
    },
    {
      parse,
      visit(ast, callback) {
        const results = transform(ast, callback);
        return results && results.code;
      },
    }
  );

  expect(code || '').toEqual(expectedOutput);
}

module.exports = function templateTest(options) {
  let details = transformDetails(options);

  let plugin = require(details.transformPath);

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
        let testInputPath = path.join(details.fixtureDir, `${testName}${extension}`);
        let inputPath = path.join(details.fixtureDir, `${testName}.input${extension}`);
        let outputPath = path.join(details.fixtureDir, `${testName}.output${extension}`);

        describe(testName, function() {
          it('transforms correctly', function() {
            runTemplateTest(
              plugin,
              { path: testInputPath, source: fs.readFileSync(inputPath, 'utf8') },
              fs.readFileSync(outputPath, 'utf8')
            );
          });

          it('is idempotent', function() {
            runTemplateTest(
              plugin,
              { path: testInputPath, source: fs.readFileSync(outputPath, 'utf8') },
              fs.readFileSync(outputPath, 'utf8')
            );
          });
        });
      });
  });
};
