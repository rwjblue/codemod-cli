'use strict';

module.exports = {
  command: 'new <project-name>',
  desc: 'Generate a new codemod project',
  builder: yargs => {
    yargs.positional('project-name', {
      describe: 'The name of the project to generate',
    });
  },
  handler: function(options) {
    let { projectName } = options;

    const fs = require('fs-extra');

    fs.ensureDirSync(projectName);
    fs.writeJsonSync(projectName + '/package.json', {
      name: projectName,
      version: '0.1.0',
    });
    fs.ensureDirSync(projectName + '/transforms');
    fs.writeFileSync(projectName + '/transforms/.gitkeep', '', 'utf8');
  },
};
