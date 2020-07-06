'use strict';

const DEFAULT_EXTENSIONS = 'js,ts';

async function runTransform(binRoot, transformName, args, extensions = DEFAULT_EXTENSIONS) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { parseTransformArgs, extractJSCodeShiftOptions } = require('./options-support');

  let { paths, options } = parseTransformArgs(args);
  let { cliOptions, jsCodeShiftOptions } = extractJSCodeShiftOptions(options);

  try {
    let foundPaths = await globby(paths, {
      expandDirectories: { extensions: extensions.split(',') },
    });
    let transformPath = path.join(binRoot, '..', 'transforms', transformName, 'index.js');

    let jscodeshiftPkg = require('jscodeshift/package');
    let jscodeshiftPath = path.dirname(require.resolve('jscodeshift/package'));
    let binPath = path.join(jscodeshiftPath, jscodeshiftPkg.bin.jscodeshift);

    let binOptions = ['-t', transformPath, '--extensions', extensions, ...jsCodeShiftOptions, ...foundPaths];

    return execa(binPath, binOptions, {
      stdio: 'inherit',
      env: {
        CODEMOD_CLI_ARGS: JSON.stringify(cliOptions),
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
