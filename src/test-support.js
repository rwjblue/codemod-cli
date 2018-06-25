'use strict';

/* global it, describe */

const { runInlineTest } = require('jscodeshift/dist/testUtils');
const fs = require('fs-extra');
const path = require('path');

function transformDetails(options) {
  let root = process.cwd() + `/transforms/${options.name}/`;

  return {
    name: options.name,
    root,
    transformPath: root + 'index.js',
    fixtureDir: root + '__testfixtures__/',
  };
}

function jscodeshiftTest(options) {
  let details = transformDetails(options);

  let transform = require(details.transformPath);

  describe(details.name, function() {
    fs.readdirSync(details.fixtureDir)
      .filter(filename => /\.input$/.test(path.basename(filename, path.extname(filename))))
      .forEach(filename => {
        let extension = path.extname(filename);
        let testName = filename.replace(`.input${extension}`, '');
        let inputPath = path.join(details.fixtureDir, `${testName}.input${extension}`);
        let outputPath = path.join(details.fixtureDir, `${testName}.output${extension}`);

        describe(testName, function() {
          it('transforms correctly', function() {
            runInlineTest(
              transform,
              {},
              { source: fs.readFileSync(inputPath, 'utf8') },
              fs.readFileSync(outputPath, 'utf8')
            );
          });

          it('is idempotent', function() {
            runInlineTest(
              transform,
              {},
              { source: fs.readFileSync(outputPath, 'utf8') },
              fs.readFileSync(outputPath, 'utf8')
            );
          });
        });
      });
  });
}

function runTransformTest(options) {
  switch (options.type) {
    case 'jscodeshift':
      return jscodeshiftTest(options);
  }
}

module.exports = {
  runTransformTest,
};
