#!/usr/bin/env node
'use strict';

const importLocal = require('import-local');
const pkgUp = require('pkg-up');

function insideProject() {
  let nearestPackagePath = pkgUp.sync();

  if (nearestPackagePath === null) {
    return false;
  }

  let pkg = require(nearestPackagePath);

  return pkg.keywords && pkg.keywords.includes('codemod-cli');
}

if (importLocal(__filename) || insideProject()) {
  require('yargs')
    .commandDir('../commands/local')
    .demandCommand()
    .help()
    .epilog('For more information, see https://github.com/rwjblue/codemod-cli')
    .parse();
} else {
  require('yargs')
    .commandDir('../commands/global')
    .demandCommand()
    .help()
    .epilog('For more information, see https://github.com/rwjblue/codemod-cli')
    .parse();
}
