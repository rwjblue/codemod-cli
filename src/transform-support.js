'use strict';

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
};
