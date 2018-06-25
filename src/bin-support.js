'use strict';

function runTransform(binRoot, transformName, paths) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');

  return globby(paths)
    .then(paths => {
      let transformPath = path.join(binRoot, '..', 'transforms', transformName, 'index.js');

      return execa('jscodeshift', ['-t', transformPath, '--extensions', 'js,ts', ...paths], {
        stdio: 'inherit',
      });
    })
    .catch(error => {
      console.error(chalk.red(error.stack)); // eslint-disable-line no-console
      process.exitCode = 1;

      throw error;
    });
}

module.exports = {
  runTransform,
};
