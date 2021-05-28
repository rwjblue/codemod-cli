module.exports.command = 'codemod <codemod-name>';
module.exports.desc = 'Generate a new codemod file';

module.exports.builder = function builder(yargs) {
  yargs
    .positional('codemod-name', {
      describe: 'the name of the codemod to generate',
    })
    .option('codemod-dir', {
      type: 'string',
      describe: 'the path to the transform directory',
      default: `./transforms/`,
    })
    .option('type', {
      alias: 't',
      describe: 'choose the transform type',
      choices: ['js', 'hbs'],
      default: 'js',
    });
};

function jsHandler(options) {
  const fs = require('fs-extra');
  const path = require('path');
  const { stripIndent } = require('common-tags');
  const importCwd = require('import-cwd');
  const generateFixture = require('./fixture').handler;

  let { codemodName } = options;
  let projectName = importCwd('./package.json').name;
  let codemodDir = path.join(options.codemodDir, codemodName);

  fs.outputFileSync(
    `${codemodDir}/index.js`,
    stripIndent`
      const { getParser } = require('codemod-cli').jscodeshift;
      const { getOptions } = require('codemod-cli');

      module.exports = function transformer(file, api) {
        const j = getParser(api);
        const options = getOptions();

        return j(file.source)
          .find(j.Identifier)
          .forEach(path => {
            path.node.name = path.node.name
              .split('')
              .reverse()
              .join('');
          })
          .toSource();
      };
      
      module.exports.type = 'js';
  `,
    'utf8'
  );
  fs.outputFileSync(
    `${codemodDir}/test.js`,
    stripIndent`
      'use strict';

      const { runTransformTest } = require('codemod-cli');

      runTransformTest({ 
        name: '${codemodName}',
        path: require.resolve('./index.js'),
      });
    `,
    'utf8'
  );
  fs.outputFileSync(
    `${codemodDir}/README.md`,
    stripIndent`
      # ${codemodName}\n

      ## Usage

      \`\`\`
      npx ${projectName} ${codemodName} path/of/files/ or/some**/*glob.js

      # or

      yarn global add ${projectName}
      ${projectName} ${codemodName} path/of/files/ or/some**/*glob.js
      \`\`\`

      ## Local Usage
      \`\`\`
      node ./bin/cli.js ${codemodName} path/of/files/ or/some**/*glob.js
      \`\`\`

      ## Input / Output

      <!--FIXTURES_TOC_START-->
      <!--FIXTURES_TOC_END-->

      <!--FIXTURES_CONTENT_START-->
      <!--FIXTURES_CONTENT_END-->
    `,
    'utf8'
  );

  generateFixture({
    codemodName,
    codemodDir: options.codemodDir,
    fixtureName: 'basic',
    type: options.type,
  });
}

function hbsHandler(options) {
  const fs = require('fs-extra');
  const { stripIndent } = require('common-tags');
  const importCwd = require('import-cwd');
  const generateFixture = require('./fixture').handler;

  let { codemodName } = options;
  let projectName = importCwd('./package.json').name;
  let codemodDir = `${process.cwd()}/transforms/${codemodName}`;

  fs.outputFileSync(
    `${codemodDir}/index.js`,
    stripIndent`
      module.exports = function ({ source /*, path*/ }, { parse, visit }) {
        const ast = parse(source);
      
        return visit(ast, (env) => {
          let { builders: b } = env.syntax;
      
          return {
            MustacheStatement() {
              return b.mustache(b.path('wat-wat'));
            },
          };
        });
      };
      
      module.exports.type = 'hbs';
  `,
    'utf8'
  );
  fs.outputFileSync(
    `${codemodDir}/test.js`,
    stripIndent`
      'use strict';

      const { runTransformTest } = require('codemod-cli');
      
      runTransformTest({
        name: '${codemodName}',
      });
    `,
    'utf8'
  );
  fs.outputFileSync(
    `${codemodDir}/README.md`,
    stripIndent`
      # ${codemodName}\n

      ## Usage

      \`\`\`
      npx ${projectName} ${codemodName} path/of/files/ or/some**/*glob.hbs

      # or

      yarn global add ${projectName}
      ${projectName} ${codemodName} path/of/files/ or/some**/*glob.hbs
      \`\`\`

      ## Local Usage
      \`\`\`
      node ./bin/cli.js ${codemodName} path/of/files/ or/some**/*glob.hbs
      \`\`\`

      ## Input / Output

      <!--FIXTURES_TOC_START-->
      <!--FIXTURES_TOC_END-->

      <!--FIXTURES_CONTENT_START-->
      <!--FIXTURES_CONTENT_END-->
    `,
    'utf8'
  );

  generateFixture({
    codemodName,
    codemodDir: options.codemodDir,
    fixtureName: 'basic',
    type: options.type,
  });
}

module.exports.handler = function handler(options) {
  switch (options.type) {
    case 'js':
      return jsHandler(options);
    case 'hbs':
      return hbsHandler(options);
    default:
      throw new Error(`Unknown type: "${options.type}"`);
  }
};
