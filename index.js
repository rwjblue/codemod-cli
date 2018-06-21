#!/usr/bin/env node

'use strict';

/* eslint-env node */

require('yargs')
  .commandDir('commands')
  .demandCommand()
  .help()
  .epilog('For more information, see https://github.com/rwjblue/codemod-cli')
  .parse();
