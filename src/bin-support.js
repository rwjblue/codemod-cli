'use strict';

const DEFAULT_JS_EXTENSIONS = 'js,ts';
const DEFAULT_TEMPLATE_EXTENSIONS = 'hbs';

async function runJsTransform(binRoot, transformName, args, extensions = DEFAULT_JS_EXTENSIONS) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { parseTransformArgs } = require('./options-support');

  let { paths, options } = parseTransformArgs(args);

  try {
    let foundPaths = await globby(paths, {
      expandDirectories: { extensions: extensions.split(',') },
    });
    let transformPath = path.join(binRoot, '..', 'transforms', transformName, 'index.js');

    let jscodeshiftPkg = require('jscodeshift/package');
    let jscodeshiftPath = path.dirname(require.resolve('jscodeshift/package'));
    let binPath = path.join(jscodeshiftPath, jscodeshiftPkg.bin.jscodeshift);

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

async function runTemplateTransform(
  binRoot,
  transformName,
  args,
  extensions = DEFAULT_TEMPLATE_EXTENSIONS
) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { parseTransformArgs } = require('./options-support');

  let { paths, options } = parseTransformArgs(args);

  try {
    let foundPaths = await globby(paths, {
      expandDirectories: { extensions: extensions.split(',') },
    });
    let transformPath = path.join(binRoot, '..', 'transforms', transformName, 'index.js');

    let templateRecastPkg = require('ember-template-recast/package');
    let templateRecastPath = path.dirname(require.resolve('ember-template-recast/package'));
    let binPath = path.join(templateRecastPath, templateRecastPkg.bin);

    let binOptions = ['-t', transformPath, ...foundPaths];

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

async function runTransform(binRoot, transformName, args, extensions, type = 'jscodeshift') {
  switch (type) {
    case 'jscodeshift':
      return runJsTransform(binRoot, transformName, args, extensions);
    case 'template':
      return runTemplateTransform(binRoot, transformName, args, extensions);
  }
}

module.exports = {
  runTransform,
};
