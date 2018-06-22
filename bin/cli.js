#!/usr/bin/env node
'use strict';

/* eslint-env node */

const Liftoff = require('liftoff');
let CodemodCLI = new Liftoff({
  name: 'codemod-cli',
  configName: '.codemod-cli',
});

CodemodCLI.launch({}, (/* env */) => {
  // eslint-disable-next-line no-global-assign
  require = require('esm')(module /*, options*/);

  const args = require('yargs')
    .commandDir('../commands')
    .demandCommand()
    .help()
    .epilog('For more information, see https://github.com/rwjblue/codemod-cli');

  args.parse();
});
