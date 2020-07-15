'use strict';

/* global expect */

const { transform, parse } = require('ember-template-recast');

module.exports = function runTemplateTest(plugin, { path: pluginPath, source }, expectedOutput) {
  const code = plugin(
    {
      path: pluginPath,
      source,
    },
    {
      parse,
      visit(ast, callback) {
        const results = transform(ast, callback);
        return results && results.code;
      },
    }
  );

  expect(code || '').toEqual(expectedOutput);
};
