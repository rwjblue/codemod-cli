module.exports.command = 'export <codemod-name>';
module.exports.desc = 'Export the current transform to ast-explorer';

module.exports.builder = function builder(yargs) {
  yargs.positional('codemod-name', {
    describe: 'the name of the codemod to export',
  });
};

module.exports.handler = function handler(options) {
  const fs = require('fs-extra');

  let { codemodName } = options;

  const Octokit = require('@octokit/rest');
  const octokit = new Octokit({ auth: process.env.CODEMOD_CLI_API_KEY });

  let files = {
    'astexplorer.json': {
      content: `{
        "v": 2,
        "parserID": "recast",
        "toolID": "jscodeshift",
        "settings": {
          "recast": null,
        },
        "versions": {
          "recast": "0.18.2",
          "jscodeshift": "0.6.4"
        }
      }`,
    },
    'source.js': {
      content: 'console.log("hello world");',
    },
    'tranform.js': {
      content: fs.readFileSync(`${process.cwd()}/transforms/${codemodName}/index.js`, 'utf-8'),
    },
  };

  octokit.gists
    .create({
      files,
    })
    .then(({ data }) => {
      // https://api.github.com/gists/de5cff0a12c2aaf129f94b775306af6f

      // Getting the revision url and replace it with astexplorer format
      //let url = data.history[0].url.replace('api.github.com/gists', 'astexplorer.net/#/gist');
      let gistId = data.id;
      let url = `https://astexplorer.net/#/gist/${gistId}`;
      const exec = require('child_process').exec;
      exec(`open ${url}`);
    })
    .catch(err => {
      console.log('Error: ', err);
    });
};
