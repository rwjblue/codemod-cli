#!/usr/bin/env node
'use strict';

/* eslint-env node */

// eslint-disable-next-line no-global-assign
require = require('esm')(module /*, options*/);

const args = require('yargs')
  .commandDir('../commands')
  .demandCommand()
  .help()
  .epilog('For more information, see https://github.com/rwjblue/codemod-cli');

const Liftoff = require('liftoff');
let CodemodCLI = new Liftoff({
  name: 'codemod-cli',
  configName: '.codemod-cli',
});

CodemodCLI.launch({}, (/* env */) => {
  args.parse();
});
