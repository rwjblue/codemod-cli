#!/usr/bin/env node
'use strict';

if (process.env.REQUIRE_TRACE) {
  // eslint-disable-next-line node/no-unpublished-require
  const requireSoSlow = require('require-so-slow');
  process.on('exit', function() {
    requireSoSlow.write('require-trace.trace');
  });
}

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
    .locale('en')
    .commandDir('../commands/local')
    .demandCommand()
    .help()
    .epilog('For more information, see https://github.com/rwjblue/codemod-cli')
    .parse();
} else {
  require('yargs')
    .locale('en')
    .commandDir('../commands/global')
    .demandCommand()
    .help()
    .epilog('For more information, see https://github.com/rwjblue/codemod-cli')
    .parse();
}
