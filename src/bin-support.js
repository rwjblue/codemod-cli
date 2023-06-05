'use strict';

const DEFAULT_JS_EXTENSIONS = 'js,ts';

async function runJsTransform(transformPath, args, extensions = DEFAULT_JS_EXTENSIONS) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { Readable } = require('stream');
  const { parseTransformArgs } = require('./options-support');

  let { paths, options, transformerOptions } = parseTransformArgs(args);

  try {
    let foundPaths = await globby(paths, {
      expandDirectories: { extensions: extensions.split(',') },
      gitignore: true,
    });

    let jscodeshiftPkg = require('jscodeshift/package');

    let jscodeshiftPath = path.dirname(require.resolve('jscodeshift/package'));
    let binPath = path.join(jscodeshiftPath, jscodeshiftPkg.bin.jscodeshift);

    let binOptions = [
      '--no-babel',
      '-t',
      transformPath,
      '--extensions',
      extensions,
      ...transformerOptions,
      '--stdin', // tell jscodeshift to read the list of files from stdin
    ];

    let handle = execa(binPath, binOptions, {
      stdout: 'inherit',
      stderr: 'inherit',
      stdin: 'pipe', // must be pipe for the below
      env: {
        CODEMOD_CLI_ARGS: JSON.stringify(options),
      },
    });

    // https://github.com/ember-codemods/es5-getter-ember-codemod/issues/34
    let pathsStream = new Readable();
    pathsStream.push(foundPaths.join('\n'));
    pathsStream.push(null);
    pathsStream.pipe(handle.stdin);

    return await handle;
  } catch (error) {
    console.error(chalk.red(error.stack)); // eslint-disable-line no-console
    process.exitCode = 1;

    throw error;
  }
}

async function runTemplateTransform(transformPath, args) {
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const { parseTransformArgs } = require('./options-support');

  let { paths, options } = parseTransformArgs(args);

  try {
    let binOptions = ['-t', transformPath, ...paths];
    let templateRecastDir = path.dirname(require.resolve('ember-template-recast/package.json'));
    let templateRecastPkg = require('ember-template-recast/package');

    // npm@6 changes `bin: 'lib/bin.js'` into `bin: { 'ember-template-recast':
    // 'lib/bin.js' }` automatically this ensures that we read either format
    let templateRecastBinPath =
      typeof templateRecastPkg.bin === 'string'
        ? templateRecastPkg.bin
        : templateRecastPkg.bin['ember-template-recast'];

    return execa(path.join(templateRecastDir, templateRecastBinPath), binOptions, {
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
      return runJsTransform(transformPath, args, extensions);
    case 'hbs':
      return runTemplateTransform(transformPath, args);
    default:
      throw new Error(`Unknown type passed to runTransform: "${type}"`);
  }
}

module.exports = {
  runTransform,
};
