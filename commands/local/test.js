module.exports.command = 'test';
module.exports.aliases = ['t'];
module.exports.desc = 'Run your projects tests';

module.exports.builder = function builder(yargs) {
  yargs.option('testNamePattern=[query]', {
    nargs: 1,
    string: true,
    requiresArg: true,
    description: 'Run only tests with a name that matches the regex',
  });

  yargs.option('runInBand', {
    description:
      'Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests. This can be useful for debugging.',
  });

  return yargs;
};

module.exports.handler = function handler() {
  const importCwd = require('import-cwd');

  importCwd('jest').run();
};
