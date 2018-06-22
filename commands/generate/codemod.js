export const command = 'codemod <codemod-name>';
export const desc = 'Generate a new codemod file';

export function builder(yargs) {
  yargs.positional('codemod-name', {
    describe: 'the name of the codemod to generate',
  });
}

export function handler(options) {
  let { codemodName } = options;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  const fs = require('fs-extra');

  fs.outputFileSync(`${codemodDir}/index.js`, '', 'utf8');
  fs.outputFileSync(`${codemodDir}/README.md`, `# ${codemodName}\n`, 'utf8');
}
