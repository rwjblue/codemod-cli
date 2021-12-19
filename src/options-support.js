const yargs = require('yargs');

const jsCodeShiftOptions = [
  'dry',
  'ignore-config',
  'ignore-pattern',
  'print',
  'run-in-band',
  'silent',
  'stdin',
  'verbose',
];

function parseTransformArgs(args, codeShiftOptions = jsCodeShiftOptions) {
  let parsedArgs = yargs.parse(args);
  let paths = parsedArgs._;
  let { options, transformerOptions } = Object.keys(parsedArgs).reduce(
    (acc, key) => {
      if (!['_', '$0', 'help', 'version'].includes(key)) {
        let KeyInkebabCase = key.replace(
          /([a-z])([A-Z])/g,
          (_, $1, $2) => `${$1}-${$2.toLowerCase()}`
        );
        if (codeShiftOptions.includes(key)) {
          acc.transformerOptions.push(`--${key}`, parsedArgs[key]);
        } else if (!codeShiftOptions.includes(KeyInkebabCase)) {
          acc.options[key] = parsedArgs[key];
        }
      }
      return acc;
    },
    {
      options: {},
      transformerOptions: [],
    }
  );
  return { paths, options, transformerOptions };
}

function getOptions() {
  try {
    return JSON.parse(process.env.CODEMOD_CLI_ARGS);
  } catch (e) {
    return {};
  }
}

module.exports = { parseTransformArgs, getOptions };
