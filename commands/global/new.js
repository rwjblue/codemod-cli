'use strict';

module.exports.command = 'new <project-name>';
module.exports.desc = 'Generate a new codemod project';

module.exports.builder = function builder(yargs) {
  yargs.positional('project-name', {
    describe: 'The name of the project to generate',
  });
};

module.exports.handler = async function handler(options) {
  let { projectName } = options;

  const fs = require('fs-extra');
  const { stripIndent } = require('common-tags');
  const latestVersion = require('latest-version');
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
        lint: 'eslint --cache .',
        test: 'codemod-cli test',
        'test:coverage': 'codemod-cli test --coverage',
        'update-docs': 'codemod-cli update-docs',
        coveralls: 'cat ./coverage/lcov.info | node node_modules/.bin/coveralls',
      },
      bin: './bin/cli.js',
      keywords: ['codemod-cli'],
      dependencies: {
        'codemod-cli': `^${pkg.version}`,
      },
      devDependencies: {
        coveralls: pkg.devDependencies.coveralls,
        eslint: `^${await latestVersion('eslint')}`,
        'eslint-config-prettier': `^${await latestVersion('eslint-config-prettier')}`,
        'eslint-plugin-node': `^${await latestVersion('eslint-plugin-node')}`,
        'eslint-plugin-prettier': `^${await latestVersion('eslint-plugin-prettier')}`,
        jest: pkg.devDependencies.jest,
        prettier: `^${await latestVersion('prettier')}`,
      },
      engines: pkg.engines,
      jest: {
        testEnvironment: 'node',
      },
    },
    {
      spaces: 2,
    }
  );

  // linting setup
  fs.outputFileSync(
    projectName + '/.eslintrc.js',
    stripIndent`
      module.exports = {
        parserOptions: {
          ecmaVersion: 2018,
        },

        plugins: ['prettier', 'node'],
        extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:node/recommended'],
        env: {
          node: true,
        },
        rules: {},
        overrides: [
          {
            files: ['__tests__/**/*.js'],
            env: {
              jest: true,
            },
          },
        ],
      };` + '\n'
  );
  fs.outputFileSync(
    projectName + '/.eslintignore',
    stripIndent`
      !.*
      __testfixtures__
    `
  );
  fs.outputFileSync(
    projectName + '/.prettierrc',
    stripIndent`
      {
        "singleQuote": true,
        "trailingComma": "es5",
        "printWidth": 100
      }
    `
  );

  fs.outputFileSync(
    projectName + '/.travis.yml',
    stripIndent`
      ---
      language: node_js
      node_js:
        - "8"

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
        - yarn lint
        - yarn test:coverage

      after_success:
        - yarn coveralls
    `
  );
  fs.outputFileSync(
    projectName + '/bin/cli.js',
    stripIndent`
      #!/usr/bin/env node
      'use strict';

      require('codemod-cli').runTransform(
        __dirname,
        process.argv[2] /* transform name */,
        process.argv.slice(3) /* paths or globs */
      );` + '\n',
    {
      encoding: 'utf8',
      mode: 0o755 /* -rwxr-xr-x */,
    }
  );
  fs.outputFileSync(projectName + '/.gitignore', '/node_modules\n/.eslintcache');
  fs.ensureFileSync(projectName + '/transforms/.gitkeep');
};
