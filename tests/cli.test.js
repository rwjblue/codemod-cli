const fs = require('fs-extra');
const path = require('path');
const createTempDir = require('broccoli-test-helper').createTempDir;
const execa = require('execa');
const walkSync = require('walk-sync');

const PROJECT_ROOT = path.join(__dirname, '..');
const EXECUTABLE_PATH = path.join(PROJECT_ROOT, 'bin', 'cli.js');
const CodemodCLI = require('../src');
const ROOT = process.cwd();

// We need to update the linting story before we can fix this lint error. That is a much
// bigger change and can happen in a follow-up PR
// eslint-disable-next-line node/no-unsupported-features/es-syntax
import { describe, test, beforeEach, beforeAll, afterEach, assert } from 'vitest';

describe('codemod-cli', function () {
  let codemodProject;

  function setupProject(installDeps = false) {
    let sharedProject;

    beforeAll(async function () {
      sharedProject = await createTempDir();

      process.chdir(sharedProject.path());
      await execa(EXECUTABLE_PATH, ['new', 'test-project']);

      process.chdir(ROOT);
    });

    beforeEach(async function () {
      codemodProject.copy(sharedProject.path('test-project'));

      const jestPath = `${codemodProject.path()}/node_modules/jest`;
      const codemodCliPath = `${codemodProject.path()}/node_modules/codemod-cli`;

      if (installDeps) {
        await execa('npm', ['install']);
        fs.removeSync(jestPath);
        fs.removeSync(codemodCliPath);
      }

      // setup required dependencies in the project
      fs.ensureDirSync(`${codemodProject.path()}/node_modules`);
      fs.symlinkSync(`${ROOT}/node_modules/jest`, jestPath);
      fs.symlinkSync(PROJECT_ROOT, codemodCliPath);
    });
  }

  beforeEach(async function () {
    codemodProject = await createTempDir();

    process.chdir(codemodProject.path());
  });

  afterEach(async function () {
    process.chdir(ROOT);

    await codemodProject.dispose();
  });

  describe('new', function () {
    test('should generate a basic project structure', async function () {
      let result = await execa(EXECUTABLE_PATH, ['new', 'ember-qunit-codemod']);

      assert.equal(result.exitCode, 0, 'exited with zero');
      assert.deepEqual(walkSync(codemodProject.path()), [
        'ember-qunit-codemod/',
        'ember-qunit-codemod/.github/',
        'ember-qunit-codemod/.github/workflows/',
        'ember-qunit-codemod/.github/workflows/ci.yml',
        'ember-qunit-codemod/.gitignore',
        'ember-qunit-codemod/.prettierrc',
        'ember-qunit-codemod/README.md',
        'ember-qunit-codemod/bin/',
        'ember-qunit-codemod/bin/cli.js',
        'ember-qunit-codemod/eslint.config.mjs',
        'ember-qunit-codemod/package.json',
        'ember-qunit-codemod/transforms/',
        'ember-qunit-codemod/transforms/.gitkeep',
      ]);
    });
  });

  describe('linting', function () {
    setupProject(true);

    test('should pass for a basic project', async function () {
      let result = await execa('npm', ['run', 'lint']);
      assert.equal(result.exitCode, 0, 'exited with zero');
    });
  });

  describe('update-docs', function () {
    setupProject();

    test('updates top-level README with links to transform READMEs', async function () {
      codemodProject.write({
        transforms: {
          foo: { 'README.md': 'some content' },
          bar: { 'README.md': 'some content' },
        },
      });

      await execa(EXECUTABLE_PATH, ['update-docs']);

      let README = fs.readFileSync(codemodProject.path('README.md'), 'utf8');
      assert.ok(README.includes('* [foo](transforms/foo/README.md'), 'foo link');
      assert.ok(README.includes('* [bar](transforms/bar/README.md'), 'bar link');
    });

    test('should allow different input/output extensions', async function () {
      codemodProject.write({
        transforms: {
          main: {
            __testfixtures__: {
              'basic.input.js': '"starting content";',
              'basic.output.hbs': '"different content";',
            },
            'README.md': `
              <!--FIXTURES_TOC_START-->
              <!--FIXTURES_TOC_END-->
              <!--FIXTURES_CONTENT_START-->
              <!--FIXTURES_CONTENT_END-->
            `,
          },
        },
      });

      await execa(EXECUTABLE_PATH, ['update-docs']);

      let README = fs.readFileSync(codemodProject.path('transforms/main/README.md'), 'utf8');
      assert.ok(
        README.includes('[basic.input.js](transforms/main/__testfixtures__/basic.input.js)'),
        'input link'
      );
      assert.ok(
        README.includes('[basic.output.hbs](transforms/main/__testfixtures__/basic.output.hbs)'),
        'output link'
      );
    });
  });

  describe('generate', function () {
    setupProject();

    describe('codemod', function () {
      test('should generate a js codemod', async function () {
        let result = await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

        assert.equal(result.exitCode, 0, 'exited with zero');
        assert.deepEqual(walkSync(codemodProject.path('transforms')), [
          '.gitkeep',
          'main/',
          'main/README.md',
          'main/__testfixtures__/',
          'main/__testfixtures__/basic.input.js',
          'main/__testfixtures__/basic.output.js',
          'main/index.js',
          'main/test.js',
        ]);
      });

      test('should generate a codemod in a custom directory', async function () {
        let result = await execa(EXECUTABLE_PATH, [
          'generate',
          'codemod',
          'main',
          '--codemod-dir',
          'other-dir',
        ]);

        assert.equal(result.exitCode, 0, 'exited with zero');
        assert.deepEqual(walkSync(codemodProject.path('other-dir')), [
          'main/',
          'main/README.md',
          'main/__testfixtures__/',
          'main/__testfixtures__/basic.input.js',
          'main/__testfixtures__/basic.output.js',
          'main/index.js',
          'main/test.js',
        ]);
      });

      test('should generate a hbs codemod', async function () {
        let result = await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main', '--type', 'hbs']);

        assert.equal(result.exitCode, 0, 'exited with zero');
        assert.deepEqual(walkSync(codemodProject.path('transforms')), [
          '.gitkeep',
          'main/',
          'main/README.md',
          'main/__testfixtures__/',
          'main/__testfixtures__/basic.input.hbs',
          'main/__testfixtures__/basic.output.hbs',
          'main/index.js',
          'main/test.js',
        ]);
      });
    });

    describe('fixture', function () {
      test('should generate a fixture for the specified js codemod', async function () {
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);
        let result = await execa(EXECUTABLE_PATH, [
          'generate',
          'fixture',
          'main',
          'this-dot-owner',
        ]);

        assert.equal(result.exitCode, 0, 'exited with zero');
        assert.deepEqual(walkSync(codemodProject.path('transforms')), [
          '.gitkeep',
          'main/',
          'main/README.md',
          'main/__testfixtures__/',
          'main/__testfixtures__/basic.input.js',
          'main/__testfixtures__/basic.output.js',
          'main/__testfixtures__/this-dot-owner.input.js',
          'main/__testfixtures__/this-dot-owner.output.js',
          'main/index.js',
          'main/test.js',
        ]);
      });

      test('should generate a fixture for the specified hbs codemod', async function () {
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main', '--type', 'hbs']);
        let result = await execa(EXECUTABLE_PATH, [
          'generate',
          'fixture',
          'main',
          'this-dot-owner',
        ]);

        assert.equal(result.exitCode, 0, 'exited with zero');
        assert.deepEqual(walkSync(codemodProject.path('transforms')), [
          '.gitkeep',
          'main/',
          'main/README.md',
          'main/__testfixtures__/',
          'main/__testfixtures__/basic.input.hbs',
          'main/__testfixtures__/basic.output.hbs',
          'main/__testfixtures__/this-dot-owner.input.hbs',
          'main/__testfixtures__/this-dot-owner.output.hbs',
          'main/index.js',
          'main/test.js',
        ]);
      });
    });

    describe('test', function () {
      test('should pass for a basic project with an empty codemod', async function () {
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);
        await execa(EXECUTABLE_PATH, ['generate', 'fixture', 'main', 'this-dot-owner']);

        let result = await execa(EXECUTABLE_PATH, ['test']);
        assert.equal(result.exitCode, 0, 'exited with zero');
      });

      test('should pass for an empty codemod in a custom directory', async function () {
        await execa(EXECUTABLE_PATH, [
          'generate',
          'codemod',
          'main',
          '--codemod-dir',
          'other-transform-path',
        ]);
        await execa(EXECUTABLE_PATH, [
          'generate',
          'fixture',
          'main',
          'this-dot-owner',
          '--codemod-dir',
          'other-transform-path',
        ]);

        let result = await execa(EXECUTABLE_PATH, ['test']);
        assert.equal(result.exitCode, 0, 'exited with zero');
      });

      test('should fail when input and output do not match', async function () {
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);
        await execa(EXECUTABLE_PATH, ['generate', 'fixture', 'main', 'this-dot-owner']);

        codemodProject.write({
          transforms: {
            main: {
              __testfixtures__: {
                'basic.input.js': '"starting content";',
                'basic.output.js': '"different content";',
              },
            },
          },
        });

        try {
          await execa(EXECUTABLE_PATH, ['test']);
        } catch (result) {
          assert.notEqual(result.exitCode, 0, 'exited with non-zero');
        }
      });

      test('transform should receive options from ${name}.options.json', async function () {
        const expectedReplacement = 'AAAAHHHHHH';

        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

        codemodProject.write({
          transforms: {
            main: {
              'index.js': `
                  const { getParser } = require('codemod-cli').jscodeshift;
                  const { getOptions } = require('codemod-cli');
                  module.exports = function transformer(file, api) {
                    const options = getOptions();
                    const j = getParser(api);
                    return j(file.source)
                    .find(j.Literal)
                    .forEach(path => {
                      path.replace(
                        j.stringLiteral(options.replaceAll)
                      );
                    })
                    .toSource();
                  }
                `,
              __testfixtures__: {
                'basic.input.js': 'var foo = "foo";',
                'basic.output.js': `var foo = "${expectedReplacement}";`,
                'basic.options.json': `{ "replaceAll": "${expectedReplacement}" }`,
              },
            },
          },
        });

        let result = await execa(EXECUTABLE_PATH, ['test']);
        assert.equal(result.exitCode, 0, 'exited with zero');
      });

      test('transform should receive a file path in tests', async function () {
        const realCodemodProjectPath = fs.realpathSync(codemodProject.path());
        const expectedPath = `${realCodemodProjectPath}/transforms/main/__testfixtures__/basic.js`;

        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

        codemodProject.write({
          transforms: {
            main: {
              'index.js': `
                  const { getParser } = require('codemod-cli').jscodeshift;

                  module.exports = function transformer(file, api) {
                    const j = getParser(api);

                    return j(file.source)
                    .find(j.Literal)
                    .forEach(path => {
                      path.replace(
                        j.stringLiteral(file.path)
                      );
                    })
                    .toSource();
                  }
                `,
              __testfixtures__: {
                'basic.input.js': 'var foo = "foo";',
                'basic.output.js': `var foo = "${expectedPath}";`,
              },
            },
          },
        });

        let result = await execa(EXECUTABLE_PATH, ['test']);
        assert.equal(result.exitCode, 0, 'exited with zero');
      });

      test('transform should receive a subfolder file path in tests', async function () {
        const realCodemodProjectPath = fs.realpathSync(codemodProject.path());
        const expectedPath = `${realCodemodProjectPath}/transforms/main/__testfixtures__/foo/basic.js`;

        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

        codemodProject.write({
          transforms: {
            main: {
              'index.js': `
                  const { getParser } = require('codemod-cli').jscodeshift;

                  module.exports = function transformer(file, api) {
                    const j = getParser(api);

                    return j(file.source)
                    .find(j.Literal)
                    .forEach(path => {
                      path.replace(
                        j.stringLiteral(file.path)
                      );
                    })
                    .toSource();
                  }
                `,
              __testfixtures__: {
                foo: {
                  'basic.input.js': 'var foo = "foo";',
                  'basic.output.js': `var foo = "${expectedPath}";`,
                },
              },
            },
          },
        });

        let result = await execa(EXECUTABLE_PATH, ['test']);
        assert.equal(result.exitCode, 0, 'exited with zero');
      });
    });
  });

  describe('generated bin script', function () {
    setupProject();

    let userProject;
    beforeEach(async function () {
      // fix mode of bin script (lost during sharedProject.copy())
      fs.chmodSync(codemodProject.path('bin/cli.js'), 0o755);

      // includes simple identifier reverser
      await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

      userProject = await createTempDir();
      process.chdir(userProject.path());
    });

    afterEach(function () {
      process.chdir(ROOT);

      return userProject.dispose();
    });

    test('works with globs', async function () {
      userProject.write({
        foo: { 'something.js': 'let blah = bar', 'other.js': 'let blah = bar' },
      });

      await execa(codemodProject.path('bin/cli.js'), ['main', 'foo/*thing.js']);

      assert.deepEqual(userProject.read(), {
        foo: {
          'something.js': 'let halb = rab',
          'other.js': 'let blah = bar',
        },
      });
    });

    test('works with custom codemod directory', async function () {
      userProject.write({
        foo: { 'something.js': 'let blah = bar', 'other.js': 'let blah = bar' },
      });

      await execa(
        EXECUTABLE_PATH,
        ['generate', 'codemod', 'secondary', '--codemod-dir', 'other-dir'],
        {
          cwd: codemodProject.path(),
        }
      );

      await execa(codemodProject.path('bin/cli.js'), [
        codemodProject.path('./other-dir/secondary/index.js'),
        'foo/*thing.js',
      ]);

      assert.deepEqual(userProject.read(), {
        foo: {
          'something.js': 'let halb = rab',
          'other.js': 'let blah = bar',
        },
      });
    });
  });

  describe('programmatic API', function () {
    setupProject();

    describe('runTransform', function () {
      let userProject;

      beforeEach(async function () {
        // includes simple identifier reverser
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

        userProject = await createTempDir();
        process.chdir(userProject.path());
      });

      afterEach(function () {
        process.chdir(ROOT);

        return userProject.dispose();
      });

      test('runs transform', async function () {
        userProject.write({
          foo: {
            'something.js': 'let blah = bar;',
            'other.js': 'let blah = bar;',
            'otherthing.ts': 'let blah: Map = bar;',
          },
        });

        await CodemodCLI.runTransform(codemodProject.path('bin'), 'main', 'foo/*thing.[jt]s');

        assert.deepEqual(userProject.read(), {
          foo: {
            'something.js': 'let halb = rab;',
            'other.js': 'let blah = bar;',
            'otherthing.ts': 'let halb: paM = rab;',
          },
        });
      });

      test('runs transform with options', async function () {
        codemodProject.write({
          transforms: {
            main: {
              'index.js': `
                  const { getParser } = require('codemod-cli').jscodeshift;
                  const { getOptions } = require('codemod-cli');
                  module.exports = function transformer(file, api) {
                    const options = getOptions();
                    const j = getParser(api);
                    return j(file.source)
                    .find(j.Literal)
                    .forEach(path => {
                      path.replace(
                        j.stringLiteral(options.biz + options.baz)
                      );
                    })
                    .toSource();
                  }
              `,
            },
          },
        });

        userProject.write({
          foo: { 'something.js': `let blah = "bar";` },
        });

        await CodemodCLI.runTransform(codemodProject.path('bin'), 'main', [
          '--biz',
          'A',
          '--baz',
          'B',
          'foo/*ing.[jt]s',
        ]);

        assert.deepEqual(userProject.read(), {
          foo: { 'something.js': `let blah = "AB";` },
        });
      });

      test('can specify additional extensions to run against', async function () {
        codemodProject.write({
          transforms: {
            main: {
              'index.js': `
                  module.exports = function transformer(file, api) {
                    return file.source.toUpperCase();
                  }
              `,
            },
          },
        });

        userProject.write({
          foo: { 'something.hbs': `<Foo />` },
        });

        await CodemodCLI.runTransform(codemodProject.path('bin'), 'main', ['foo/**'], 'hbs');

        assert.deepEqual(userProject.read(), {
          foo: { 'something.hbs': `<FOO />` },
        });
      });

      test('should ignore patterns from configuration option', async function () {
        codemodProject.write({
          transforms: {
            main: {
              'index.js': `
                  module.exports = function transformer(file, api) {
                    return file.source.toUpperCase();
                  }
              `,
            },
          },
        });

        userProject.write({
          foo: { 'something.hbs': `<Foo />` },
          bar: { 'something.hbs': `<Foo />` },
        });

        await CodemodCLI.runTransform(
          codemodProject.path('bin'),
          'main',
          ['foo/**', 'bar/**', '--ignore-pattern', 'foo/'],
          'hbs'
        );

        assert.deepEqual(userProject.read(), {
          foo: { 'something.hbs': `<Foo />` },
          bar: { 'something.hbs': `<FOO />` },
        });
      });

      test('should ignore patterns from configuration file', async function () {
        codemodProject.write({
          transforms: {
            main: {
              'index.js': `
                  module.exports = function transformer(file, api) {
                    return file.source.toUpperCase();
                  }
              `,
            },
          },
        });

        userProject.write({
          config: { '.gitignore': `foo/` },
          foo: { 'something.hbs': `<Foo />` },
          bar: { 'something.hbs': `<Foo />` },
        });

        await CodemodCLI.runTransform(
          codemodProject.path('bin'),
          'main',
          ['foo/**', 'bar/**', '--ignore-config', 'config/.gitignore'],
          'hbs'
        );

        assert.deepEqual(userProject.read(), {
          config: { '.gitignore': `foo/` },
          foo: { 'something.hbs': `<Foo />` },
          bar: { 'something.hbs': `<FOO />` },
        });
      });

      test('runs transform against class syntax', async function () {
        userProject.write({
          foo: {
            'something.js': `
                class Blah {
                  blah = bar;
                }
              `,
            'other.js': `
                class Blah {
                  blah = bar;
                }
              `,
            'otherthing.ts': `
                class Blah {
                  blah: Map = bar;
                }
              `,
          },
        });

        await CodemodCLI.runTransform(codemodProject.path('bin'), 'main', 'foo/*thing.[jt]s');

        assert.deepEqual(userProject.read(), {
          foo: {
            'something.js': `
                class halB {
                  halb = rab;
                }
              `,
            'other.js': `
                class Blah {
                  blah = bar;
                }
              `,
            'otherthing.ts': `
                class halB {
                  halb: paM = rab;
                }
              `,
          },
        });
      });

      test('runs transform against decorator syntax', async function () {
        userProject.write({
          foo: {
            'something.js': `
                class Blah {
                  @bar
                  blah() {}
                }
              `,
            'other.js': `
                class Blah {
                  @bar
                  blah() {}
                }
              `,
            'otherthing.ts': `
                class Blah {
                  @bar
                  blah() {}
                }
              `,
          },
        });

        await CodemodCLI.runTransform(codemodProject.path('bin'), 'main', 'foo/*thing.[jt]s');

        assert.deepEqual(userProject.read(), {
          foo: {
            'something.js': `
                class halB {
                  @rab
                  halb() {}
                }
              `,
            'other.js': `
                class Blah {
                  @bar
                  blah() {}
                }
              `,
            'otherthing.ts': `
                class halB {
                  @rab
                  halb() {}
                }
              `,
          },
        });
      });
    });

    describe('runTransform type=hbs', function () {
      let userProject;

      beforeEach(async function () {
        // includes simple mustache transform
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main', '--type', 'hbs']);

        userProject = await createTempDir();
        process.chdir(userProject.path());
      });

      afterEach(function () {
        process.chdir(ROOT);

        return userProject.dispose();
      });

      test('runs transform', async function () {
        userProject.write({
          foo: {
            'something.hbs': '{{what}}',
            'other.hbs': '{{what}}',
          },
        });

        await CodemodCLI.runTransform(codemodProject.path('bin'), 'main', 'foo/*thing.hbs');

        assert.deepEqual(userProject.read(), {
          foo: {
            'something.hbs': '{{wat-wat}}',
            'other.hbs': '{{what}}',
          },
        });
      });

      test('runs transform with options', async function () {
        codemodProject.write({
          transforms: {
            main: {
              'index.js': `
                  const { getOptions } = require('codemod-cli');
                  module.exports = function ({ source /*, path*/ }, { parse, visit }) {
                    const ast = parse(source);
                    const options = getOptions();

                    return visit(ast, (env) => {
                      let { builders: b } = env.syntax;

                      return {
                        MustacheStatement() {
                          return b.mustache(b.path(options.biz + options.baz));
                        },
                      };
                    });
                  };

                  module.exports.type = 'hbs';
              `,
            },
          },
        });

        userProject.write({
          foo: { 'something.hbs': `{{foo}}` },
        });

        await CodemodCLI.runTransform(codemodProject.path('bin'), 'main', [
          '--biz',
          'A',
          '--baz',
          'B',
          'foo/*ing.hbs',
        ]);

        assert.deepEqual(userProject.read(), {
          foo: { 'something.hbs': `{{AB}}` },
        });
      });
    });
  });
});
