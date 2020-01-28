'use strict';

module.exports.command = 'new <project-name>';
module.exports.desc = 'Generate a new codemod project';

module.exports.builder = function builder(yargs) {
  yargs
    .positional('project-name', {
      describe: 'The name of the project to generate',
    })
    .option('url', {
      alias: 'u',
      demandOption: false,
      describe: 'ast-explorer gist url to import from',
      type: 'string',
    })
    .option('codemod', {
      alias: 'c',
      demandOption: false,
      describe: 'name of the codemod to generate',
      type: 'string',
    });
};

module.exports.handler = async function handler(options) {
  let { projectName, url, codemod: codemodName } = options;

  const fs = require('fs-extra');
  const { stripIndent } = require('common-tags');
  const latestVersion = require('latest-version');
  const pkg = require('../../package.json');
  const { codemodReadme, projectReadme } = require('../../src/readme-support');

  fs.outputFileSync(projectName + '/README.md', projectReadme(projectName), 'utf8');
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
    projectName + '/.github/workflows/ci.yml',
    stripIndent`
      name: CI

      on:
        push:
          branches:
            - master
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
          - name: install yarn
            run: npm install -g yarn
          - name: install dependencies
            run: yarn install
          - name: linting
            run: yarn lint

        test:
          name: Tests
          runs-on: ubuntu-latest

          strategy:
            matrix:
              node: ['^8.12.0', '10', '12']

          steps:
          - uses: actions/checkout@v1
          - uses: actions/setup-node@v1
            with:
              node-version: \${{ matrix.node }}
          - name: install yarn
            run: npm install --global yarn
          - name: install dependencies
            run: yarn
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
          - name: install yarn
            run: npm install -g yarn
          - name: install dependencies
            run: yarn install --no-lockfile
          - name: test
            run: yarn test
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

  // If import options [ url && codemod] are present
  if (url && codemodName) {
    let regex = /https:\/\/astexplorer\.net\/#\/gist\/(\w+)\/(\w+)/;
    let matches = regex.exec(url);

    let [, gist_id, gistRevision] = matches;

    let rawFile = `https://gist.githubusercontent.com/astexplorer/${gist_id}/raw/${gistRevision}/transform.js`;

    const request = require('request'); // eslint-disable-line

    request.get(rawFile, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        // HACK: Replacing export default with module.exports
        let _body = body.replace('export default', 'module.exports =');

        // Formatting with prettier to avoid possible lint errors in new project
        const prettier = require('prettier'); // eslint-disable-line
        _body = prettier.format(_body, { parser: 'babel', singleQuote: true });
        fs.outputFileSync(`${codemodDir}/index.js`, _body, 'utf8');
      }
    });

    let codemodDir = `${process.cwd()}/${projectName}/transforms/${codemodName}`;

    fs.outputFileSync(
      `${codemodDir}/test.js`,
      stripIndent`
      'use strict';

      const { runTransformTest } = require('codemod-cli');

      runTransformTest({
        type: 'jscodeshift',
        name: '${codemodName}',
      });` + '\n',
      'utf8'
    );

    fs.outputFileSync(`${codemodDir}/README.md`, codemodReadme(projectName, codemodName), 'utf-8');

    // Generate basic test fixtures
    let fixturePath = `${codemodDir}/__testfixtures__/basic`;

    fs.outputFileSync(`${fixturePath}.input.js`, '');
    fs.outputFileSync(`${fixturePath}.output.js`, '');
  }
};
