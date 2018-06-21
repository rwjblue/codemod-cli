'use strict';

module.exports = {
  command: 'generate <type>',
  builder: yargs => {
    yargs.commandDir('generate');
  },
  handler: () => {},
};
