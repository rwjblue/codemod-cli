export const command = 'codemod <name>';
export const desc = 'Generate a new codemod file';

export function builder(yargs) {
  yargs.positional('name', {
    describe: 'the name of the codemod to generate',
  });
}

export function handler(options) {
  let { codemodName } = options;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  const fs = require('fs-extra');

  fs.ensureFileSync(`${codemodDir}/index.js`, '', 'utf8');
  fs.ensureFileSync(`${codemodDir}/README.md`, `# ${codemodName}\n`, 'utf8');
}
