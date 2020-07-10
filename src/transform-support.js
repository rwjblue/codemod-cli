'use strict';

function getTransformType(transformPath) {
  const fs = require('fs-extra');

  if (!fs.existsSync(transformPath)) {
    throw new Error(`Transform ${transformPath} not found.`);
  }

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
};
