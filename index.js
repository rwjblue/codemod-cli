#!/usr/bin/env node

'use strict';

/* eslint-env node */

require('yargs')
  .commandDir('commands')
  .demandCommand()
  .help().argv;
