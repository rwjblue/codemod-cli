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
  const cliPath = '/bin/cli.js';

  fs.outputFileSync(
    projectName + '/README.md',
    stripIndent`
      # ${projectName}\n

      A collection of codemods for ${projectName}.

      ## Usage

      To run a specific codemod from this project, you would run the following:

      \`\`\`
      npx ${projectName} <TRANSFORM NAME> path/of/files/ or/some**/*glob.js

      # or

      yarn global add ${projectName}
      ${projectName} <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
      \`\`\`

      ## Local Usage
      \`\`\`
      node .${cliPath} <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
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
      bin: `.${cliPath}`,
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
    projectName + '/.github/workflows/ci.yml',
    stripIndent`
      name: CI

      on:
        push:
          branches:
            - master
            - main
            - 'v*' # older version branches
          tags:
            - '*'
        pull_request: {}
        schedule:
        - cron:  '0 6 * * 0' # weekly, on sundays

      jobs:
        lint:
          name: Linting
          runs-on: ubuntu-latest

          steps:
          - uses: actions/checkout@v1
          - uses: actions/setup-node@v1
            with:
              node-version: 12.x
          - name: install dependencies
            run: yarn install --frozen-lockfile
          - name: linting
            run: yarn lint

        test:
          name: Tests
          runs-on: ubuntu-latest

          strategy:
            matrix:
              node: ['10', '12', '14']

          steps:
          - uses: actions/checkout@v1
          - uses: actions/setup-node@v1
            with:
              node-version: \${{ matrix.node }}
          - name: install dependencies
            run: yarn install --frozen-lockfile
          - name: test
            run: yarn test

        floating-test:
          name: Floating dependencies
          runs-on: ubuntu-latest

          steps:
          - uses: actions/checkout@v1
          - uses: actions/setup-node@v1
            with:
              node-version: '12.x'
          - name: install dependencies
            run: yarn install --no-lockfile
          - name: test
            run: yarn test
    `
  );
  fs.outputFileSync(
    `${projectName}${cliPath}`,
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
