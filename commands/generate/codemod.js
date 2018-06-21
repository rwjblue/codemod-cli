'use strict';

module.exports = {
  command: 'codemod <name>',
  desc: 'Generate a new codemod file',
  builder: yargs => {
    yargs.positional('name', {
      describe: 'the name of the codemod to generate',
    });
  },
  handler: function(options) {
    let { codemodName } = options;
    let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

    const fs = require('fs-extra');

    fs.ensureFileSync(`${codemodDir}/index.js`, '', 'utf8');
    fs.ensureFileSync(`${codemodDir}/README.md`, `# ${codemodName}\n`, 'utf8');
  },
};
