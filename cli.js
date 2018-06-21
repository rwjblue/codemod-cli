#!/usr/bin/env node
'use strict';

/* eslint-env node */

// eslint-disable-next-line no-global-assign
require = require('esm')(module /*, options*/);

require('yargs')
  .commandDir('commands')
  .demandCommand()
  .help()
  .epilog('For more information, see https://github.com/rwjblue/codemod-cli')
  .parse();
