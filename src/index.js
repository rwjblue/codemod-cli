'use strict';

const TestSupport = require('./test-support');
const BinSupport = require('./bin-support');
const TransformSupport = require('./transform-support');
const OptionsSupport = require('./options-support');

module.exports = {
  runTransformTest: TestSupport.runTransformTest,
  runTransform: BinSupport.runTransform,
  jscodeshift: TransformSupport.jscodeshift,
  getOptions: OptionsSupport.getOptions,
};
