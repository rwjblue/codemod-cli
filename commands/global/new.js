'use strict';

module.exports.command = 'new <project-name>';
module.exports.desc = 'Generate a new codemod project';

module.exports.builder = function builder(yargs) {
  yargs.positional('project-name', {
    describe: 'The name of the project to generate',
  });
};

module.exports.handler = function handler(options) {
  let { projectName } = options;

  const fs = require('fs-extra');
  const { stripIndent } = require('common-tags');
  const pkg = require('../../package.json');

  fs.outputFileSync(
    projectName + '/README.md',
    stripIndent`
      # ${projectName}\n

      A collection of codemod's for ${projectName}.

      ## Usage

      To run a specific codemod from this project, you would run the following:

      \`\`\`
      npx ${projectName} <TRANSFORM NAME> path/of/files/ or/some**/*glob.js

      # or

      yarn global add ${projectName}
      ${projectName} <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
      \`\`\`

      ## Transforms

      <!--TRANSFORMS_START-->
      <!--TRANSFORMS_END-->

      ## Contributing

      ### Installation

      * clone the repo
      * change into the repo directory
      * \`yarn\`

      ### Running tests

      * \`yarn test\`

      ### Update Documentation

      * \`yarn update-docs\`
    `,
    'utf8'
  );
  fs.outputJsonSync(
    projectName + '/package.json',
    {
      name: projectName,
      version: '0.1.0',
      scripts: {
        test: 'codemod-cli test',
        'update-docs': 'codemod-cli update-docs',
      },
      bin: './bin/cli.js',
      keywords: ['codemod-cli'],
      dependencies: {
        'codemod-cli': `^${pkg.version}`,
      },
      devDependencies: {
        jest: pkg.devDependencies.jest,
      },
      jest: {
        testEnvironment: 'node',
      },
    },
    {
      spaces: 2,
    }
  );
  fs.outputFileSync(
    projectName + '/.travis.yml',
    stripIndent`
      ---
      language: node_js
      node_js:
        - "6"

      sudo: false
      dist: trusty

      cache:
        yarn: true

      before_install:
        - curl -o- -L https://yarnpkg.com/install.sh | bash
        - export PATH=$HOME/.yarn/bin:$PATH

      install:
        - yarn install

      script:
        - yarn test
    `
  );
  fs.outputFileSync(
    projectName + '/bin/cli.js',
    stripIndent`
      #!/usr/bin/env node
      'use strict';

      require('codemod-cli').runTransform(
        __dirname,
        process.argv[2]       /* transform name */,
        process.argv.slice(3) /* paths or globs */
      )
    `,
    {
      encoding: 'utf8',
      mode: 0o755 /* -rwxr-xr-x */,
    }
  );
  fs.ensureFileSync(projectName + '/transforms/.gitkeep');
};
