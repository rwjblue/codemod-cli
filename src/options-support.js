const yargs = require('yargs');

const jsCodeShiftOptions = ['ignore-config', 'ignore-pattern'];

function parseTransformArgs(args) {
  let parsedArgs = yargs.parse(args);
  let paths = parsedArgs._;
  let options = Object.keys(parsedArgs).reduce((acc, key) => {
    if (!['_', '$0', 'help', 'version'].includes(key)) {
      acc[key] = parsedArgs[key];
    }
    return acc;
  }, {});
  return { paths, options };
}

function getOptions() {
  try {
    return JSON.parse(process.env.CODEMOD_CLI_ARGS);
  } catch (e) {
    return {};
  }
}

function extractJSCodeShiftOptions(options, codeShiftOptions = jsCodeShiftOptions) {
  let cliOptions = Object.assign({}, options);
  let jsCodeShiftOptions = [];
  codeShiftOptions.forEach(option => {
    if(cliOptions.hasOwnProperty(option)) {
      let camelCaseOption = option.replace(/-([a-z])/g, (_, up) => up.toUpperCase());
      jsCodeShiftOptions.push(`--${option}`, options[option]);
      delete cliOptions[option];
      delete cliOptions[camelCaseOption];
    }
  });
  return { cliOptions, jsCodeShiftOptions };
}

module.exports = { parseTransformArgs, getOptions, extractJSCodeShiftOptions };
