'use strict';

function runTransform(binRoot, transformName, paths) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');

  return globby(paths)
    .then(paths => {
      let transformPath = path.join(binRoot, '..', 'transforms', transformName, 'index.js');

      let jscodeshiftPkg = require('jscodeshift/package');
      let jscodeshiftPath = path.dirname(require.resolve('jscodeshift/package'));
      let binPath = path.join(jscodeshiftPath, jscodeshiftPkg.bin.jscodeshift);

      return execa(binPath, ['-t', transformPath, '--extensions', 'js,ts', ...paths], {
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
