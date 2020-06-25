'use strict';

const jscodeshiftTest = require('./test-support/jscodeshift');
const templateTest = require('./test-support/template');

function runTransformTest(options) {
  switch (options.type) {
    case 'jscodeshift':
      return jscodeshiftTest(options);
    case 'template':
      return templateTest(options);
    default:
      throw new Error(`Unknown type passed to runTransformTest: "${options.type}"`);
  }
}

module.exports = {
  runTransformTest,
};
