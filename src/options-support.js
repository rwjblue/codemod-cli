const yargs = require('yargs');

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

module.exports = { parseTransformArgs, getOptions };
