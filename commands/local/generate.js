module.exports.command = 'generate <type>';
module.exports.aliases = ['g'];
module.exports.desc = 'Generate files within an existing project';

module.exports.builder = function builder(yargs) {
  yargs.commandDir('generate');
};

module.exports.handler = function handler() {};
