import pkg from '../package';

export const command = 'new <project-name>';
export const desc = 'Generate a new codemod project';

export function builder(yargs) {
  yargs.positional('project-name', {
    describe: 'The name of the project to generate',
  });
}

export function handler(options) {
  let { projectName } = options;

  const fs = require('fs-extra');

  fs.ensureDirSync(projectName);
  fs.writeJsonSync(projectName + '/package.json', {
    name: projectName,
    version: '0.1.0',
    devDependencies: {
      'codemod-cli': `^${pkg.VERSION}`,
    },
  });
  fs.ensureDirSync(projectName + '/transforms');
  fs.writeFileSync(projectName + '/transforms/.gitkeep', '', 'utf8');
}
