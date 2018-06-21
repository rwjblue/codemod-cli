#!/usr/bin/env node

'use strict';

/* eslint-env node */

const fs = require('fs-extra');

require('yargs')
  .command(
    'new <project-name>',
    'Generate a new codemod project',
    yargs => {
      yargs.positional('project-name', {
        describe: 'The name of the project to generate',
      });
    },
    function(options) {
      let { projectName } = options;

      fs.ensureDirSync(projectName);
      fs.writeJsonSync(projectName + '/package.json', {
        name: projectName,
        version: '0.1.0',
      });
      fs.ensureDirSync(projectName + '/transforms');
      fs.writeFileSync(projectName + '/transforms/.gitkeep', '', 'utf8');
    }
  )
  .command(
    'generate <type> <codemod-name> [fixture-name]',
    'Generate a new codemod file or a fixture for an existing codemod',
    yargs => {
      yargs
        .positional('type', {
          describe: 'the type of thing to generate',
          choices: ['codemod', 'fixture'],
        })
        .positional('codemod-name', {
          describe:
            'the name of the codemod to generate (or add a fixture for)',
        });
    },
    function(options) {
      let { type, codemodName, fixtureName } = options;
      let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

      if (type === 'codemod') {
        fs.ensureFileSync(`${codemodDir}/index.js`, '', 'utf8');
        fs.ensureFileSync(
          `${codemodDir}/README.md`,
          `# ${codemodName}\n`,
          'utf8'
        );
      } else if (type === 'fixture') {
        let fixturePath = `${codemodDir}/__test_fixtures__/${fixtureName}`;

        fs.ensureFileSync(`${fixturePath}.input.js`, '');
        fs.ensureFileSync(`${fixturePath}.output.js`, '');
      }
    }
  )
  .help().argv;
