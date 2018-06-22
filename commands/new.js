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

  fs.outputFileSync(projectName + '/README.md', `# ${projectName}\n`, 'utf8');
  fs.outputJsonSync(
    projectName + '/package.json',
    {
      name: projectName,
      version: '0.1.0',
      devDependencies: {
        'codemod-cli': `^${pkg.version}`,
        jest: pkg.devDependencies.jest,
      },
    },
    {
      spaces: 2,
    }
  );
  fs.ensureFileSync(projectName + '/transforms/.gitkeep');
}
