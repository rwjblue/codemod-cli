'use strict';

const jscodeshiftTest = require('./test-support/jscodeshift');
const templateTest = require('./test-support/template');
const { transformDetails } = require('./test-support/utils');

function runTransformTest(options) {
  let details = transformDetails(options);

  switch (details.transformType) {
    case 'js':
      return jscodeshiftTest(options);
    case 'hbs':
      return templateTest(options);
    default:
      throw new Error(`Unknown type of transform: "${details.transformType}"`);
  }
}

module.exports = {
  runTransformTest,
};
