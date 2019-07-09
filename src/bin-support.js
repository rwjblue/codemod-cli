'use strict';

const DEFAULT_EXTENSIONS = 'js,ts';

async function runTransform(binRoot, transformName, args) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { parseTransformArgs } = require('./options-support');

  let { paths, options } = parseTransformArgs(args);

  try {
    let foundPaths = await globby(paths);
    let transformPath = path.join(binRoot, '..', 'transforms', transformName, 'index.js');

    let jscodeshiftPkg = require('jscodeshift/package');
    let jscodeshiftPath = path.dirname(require.resolve('jscodeshift/package'));
    let binPath = path.join(jscodeshiftPath, jscodeshiftPkg.bin.jscodeshift);

    let extensions = options.extensions || DEFAULT_EXTENSIONS;

    let binOptions = ['-t', transformPath, '--extensions', extensions, ...foundPaths];

    return execa(binPath, binOptions, {
      stdio: 'inherit',
      env: {
        CODEMOD_CLI_ARGS: JSON.stringify(options),
      },
    });
  } catch (error) {
    console.error(chalk.red(error.stack)); // eslint-disable-line no-console
    process.exitCode = 1;

    throw error;
  }
}

module.exports = {
  runTransform,
};
