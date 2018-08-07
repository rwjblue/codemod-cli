'use strict';

function runTransform(binRoot, transformName, args) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { parseTransformArgs } = require('./options-support');

  let { paths, options } = parseTransformArgs(args);

  return globby(paths)
    .then(paths => {
      let transformPath = path.join(binRoot, '..', 'transforms', transformName, 'index.js');

      let jscodeshiftPkg = require('jscodeshift/package');
      let jscodeshiftPath = path.dirname(require.resolve('jscodeshift/package'));
      let binPath = path.join(jscodeshiftPath, jscodeshiftPkg.bin.jscodeshift);

      return execa(binPath, ['-t', transformPath, '--extensions', 'js,ts', ...paths], {
        stdio: 'inherit',
        env: {
          CODEMOD_CLI_ARGS: JSON.stringify(options),
        },
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
