export const command = 'generate <type>';
export const desc = 'Generate files within an existing project';

export function builder(yargs) {
  yargs.commandDir('generate');
}

export function handler() {}
