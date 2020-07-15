'use strict';

function getTransformPath(root, transformName) {
  const path = require('path');

  return require.resolve(path.join(root, 'transforms', transformName));
}

function getTransformType(transformPath) {
  return require(transformPath).type || 'js'; // fallback to 'js' if `type` export does not exist
}

function getJSCodeshiftParser(api) {
  try {
    let parser = require('recast/parsers/typescript');

    return api.jscodeshift.withParser(parser);
  } catch (e) {
    // eslint-disable-next-line
    console.log(
      'could not load typescript aware parser, falling back to standard recast parser...'
    );

    return api.jscodeshift;
  }
}

module.exports = {
  jscodeshift: {
    getParser: getJSCodeshiftParser,
  },
  getTransformType,
  getTransformPath,
};
