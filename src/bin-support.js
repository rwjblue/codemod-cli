'use strict';

const DEFAULT_JS_EXTENSIONS = 'js,ts';

async function runJsTransform(root, transformName, args, extensions = DEFAULT_JS_EXTENSIONS) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { parseTransformArgs } = require('./options-support');
  const { getTransformPath } = require('./transform-support');

  let { paths, options, transformerOptions } = parseTransformArgs(args);

  try {
    let foundPaths = await globby(paths, {
      expandDirectories: { extensions: extensions.split(',') },
    });
    let transformPath = getTransformPath(root, transformName);

    let jscodeshiftPkg = require('jscodeshift/package');
    let jscodeshiftPath = path.dirname(require.resolve('jscodeshift/package'));
    let binPath = path.join(jscodeshiftPath, jscodeshiftPkg.bin.jscodeshift);

    let binOptions = [
      '-t',
      transformPath,
      '--extensions',
      extensions,
      ...transformerOptions,
      ...foundPaths,
    ];

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

async function runTemplateTransform(root, transformName, args) {
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { parseTransformArgs } = require('./options-support');
  const { getTransformPath } = require('./transform-support');

  let { paths, options } = parseTransformArgs(args);

  try {
    let transformPath = getTransformPath(root, transformName);
    let binOptions = ['-t', transformPath, ...paths];
    let templateRecastDir = path.dirname(require.resolve('ember-template-recast/package.json'));
    let templateRecastPkg = require('ember-template-recast/package');
    let templateRecastBinPath = path.join(templateRecastDir, templateRecastPkg.bin);

    return execa(templateRecastBinPath, binOptions, {
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

async function runTransform(binRoot, transformName, args, extensions) {
  const { getTransformType, getTransformPath } = require('./transform-support');
  const path = require('path');

  let root = path.join(binRoot, '..');
  let transformPath = getTransformPath(root, transformName);
  let type = getTransformType(transformPath);

  switch (type) {
    case 'js':
      return runJsTransform(root, transformName, args, extensions);
    case 'hbs':
      return runTemplateTransform(root, transformName, args);
    default:
      throw new Error(`Unknown type passed to runTransform: "${type}"`);
  }
}

module.exports = {
  runTransform,
};
