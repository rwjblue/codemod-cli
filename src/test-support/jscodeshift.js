'use strict';

const { runInlineTest } = require('jscodeshift/dist/testUtils');

module.exports = function runJsTest(transform, input, expectedOutput) {
  return runInlineTest(transform, {}, input, expectedOutput);
};
