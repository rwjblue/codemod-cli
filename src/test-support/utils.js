'use strict';

function transformDetails(options) {
  const { getTransformType } = require('../transform-support');

  let root = process.cwd() + `/transforms/${options.name}/`;
  let transformPath = root + 'index.js';
  let transformType = getTransformType(transformPath);

  return {
    name: options.name,
    root,
    transformPath,
    transformType,
    fixtureDir: root + '__testfixtures__/',
  };
}

module.exports = {
  transformDetails,
};
