'use strict';

function getJSCodeshiftParser(api) {
  try {
    // this is bad, but works around a bug in recent @babel/parser versions:
    let babelParser = require('@babel/parser');
    let parser = {
      parse(source, _options) {
        let options = require('recast/parsers/_babylon_options')(_options);
        options.plugins = options.plugins.filter(plugin => plugin !== 'pipelineOperator');
        options.plugins.push(['pipelineOperator', { proposal: 'minimal' }]);
        options.plugins.push('typescript');

        return babelParser.parse(source, options);
      },
    };

    // the above should be replace with the following (once
    // https://github.com/benjamn/recast/pull/521 lands in a release):
    // let parser = require('recast/parsers/typescript');

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
