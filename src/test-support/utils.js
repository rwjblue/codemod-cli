'use strict';

function transformDetails(options) {
  const { getTransformType, getTransformPath } = require('../transform-support');
  const path = require('path');

  let transformPath = options.path ? options.path : getTransformPath(process.cwd(), options.name);
  let root = path.dirname(transformPath);
  let transformType = getTransformType(transformPath);

  return {
    name: options.name,
    root,
    transformPath,
    transformType,
    fixtureDir: path.join(root, '__testfixtures__/'),
  };
}

module.exports = {
  transformDetails,
};
