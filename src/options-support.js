const yargs = require('yargs');

const BOOLEAN_VALUES = ['true', 'false'];
function coerceArgs(value) {
  if (BOOLEAN_VALUES.includes(value)) {
    return value === 'true';
  }
  return value;
}

function parseTransformArgs(args) {
  let parsedArgs = yargs.parse(args);
  let paths = parsedArgs._;
  let options = Object.keys(parsedArgs).reduce((acc, key) => {
    if (!['_', '$0', 'help', 'version'].includes(key)) {
      acc[key] = coerceArgs(parsedArgs[key]);
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

module.exports = { parseTransformArgs, getOptions };
