const fs = require('fs-extra');
const path = require('path');
const createTempDir = require('broccoli-test-helper').createTempDir;
const execa = require('execa');
const walkSync = require('walk-sync');

const PROJECT_ROOT = path.join(__dirname, '..');
const EXECUTABLE_PATH = path.join(PROJECT_ROOT, 'bin', 'cli.js');
const CodemodCLI = require('../src');
const ROOT = process.cwd();

QUnit.module('codemod-cli', function(hooks) {
  let codemodProject;

  function setupProject(hooks) {
    let sharedProject;

    hooks.before(async function() {
      sharedProject = await createTempDir();

      process.chdir(sharedProject.path());
      await execa(EXECUTABLE_PATH, ['new', 'test-project']);

      process.chdir(ROOT);
    });

    hooks.beforeEach(function() {
      codemodProject.copy(sharedProject.path('test-project'));

      // setup required dependencies in the project
      fs.ensureDirSync(`${codemodProject.path()}/node_modules`);
      fs.symlinkSync(`${ROOT}/node_modules/jest`, `${codemodProject.path()}/node_modules/jest`);
      fs.symlinkSync(PROJECT_ROOT, `${codemodProject.path()}/node_modules/codemod-cli`);
    });
  }

  hooks.beforeEach(async function() {
    codemodProject = await createTempDir();

    process.chdir(codemodProject.path());
  });

  hooks.afterEach(async function() {
    await codemodProject.dispose();

    process.chdir(ROOT);
  });

  QUnit.module('new', function() {
    QUnit.test('should generate a basic project structure', async function(assert) {
      let result = await execa(EXECUTABLE_PATH, ['new', 'ember-qunit-codemod']);

      assert.equal(result.code, 0, 'exited with zero');
      assert.deepEqual(walkSync(codemodProject.path()), [
        'ember-qunit-codemod/',
        'ember-qunit-codemod/.gitignore',
        'ember-qunit-codemod/.travis.yml',
        'ember-qunit-codemod/README.md',
        'ember-qunit-codemod/bin/',
        'ember-qunit-codemod/bin/cli.js',
        'ember-qunit-codemod/package.json',
        'ember-qunit-codemod/transforms/',
        'ember-qunit-codemod/transforms/.gitkeep',
      ]);
    });
  });

  QUnit.module('update-docs', function(hooks) {
    setupProject(hooks);

    QUnit.test('updates top-level README with links to transform READMEs', async function(assert) {
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
  });

  QUnit.module('generate', function(hooks) {
    setupProject(hooks);

    QUnit.module('codemod', function() {
      QUnit.test('should generate a codemod', async function(assert) {
        let result = await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

        assert.equal(result.code, 0, 'exited with zero');
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
    });

    QUnit.module('fixture', function() {
      QUnit.test('should generate a fixture for the specified codemod', async function(assert) {
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);
        let result = await execa(EXECUTABLE_PATH, [
          'generate',
          'fixture',
          'main',
          'this-dot-owner',
        ]);

        assert.equal(result.code, 0, 'exited with zero');
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
    });

    QUnit.module('test', function() {
      QUnit.test('should pass for a basic project with an empty codemod', async function(assert) {
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);
        await execa(EXECUTABLE_PATH, ['generate', 'fixture', 'main', 'this-dot-owner']);

        let result = await execa(EXECUTABLE_PATH, ['test']);
        assert.equal(result.code, 0, 'exited with zero');
      });

      QUnit.test('should fail when input and output do not match', async function(assert) {
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
          assert.notEqual(result.code, 0, 'exited with non-zero');
        }
      });

      QUnit.test('transform should receive options from ${name}.options.json', async function(
        assert
      ) {
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
        assert.equal(result.code, 0, 'exited with zero');
      });

      QUnit.test('transform should receive a file path in tests', async function(assert) {
        const realCodemodProjectPath = fs.realpathSync(codemodProject.path());
        const expectedPath = `${realCodemodProjectPath}/transforms/main/__testfixtures__/basic.input.js`;

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
        assert.equal(result.code, 0, 'exited with zero');
      });

      QUnit.test('transform should receive a subfolder file path in tests', async function(assert) {
        const realCodemodProjectPath = fs.realpathSync(codemodProject.path());
        const expectedPath = `${realCodemodProjectPath}/transforms/main/__testfixtures__/foo/basic.input.js`;

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
        assert.equal(result.code, 0, 'exited with zero');
      });
    });
  });

  QUnit.module('generated bin script', function(hooks) {
    setupProject(hooks);

    let userProject;
    hooks.beforeEach(async function() {
      // fix mode of bin script (lost during sharedProject.copy())
      fs.chmodSync(codemodProject.path('bin/cli.js'), 0o755);

      // includes simple identifier reverser
      await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

      userProject = await createTempDir();
      process.chdir(userProject.path());
    });

    hooks.afterEach(function() {
      return userProject.dispose();
    });

    QUnit.test('works with globs', async function(assert) {
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
  });

  QUnit.module('programmatic API', function(hooks) {
    setupProject(hooks);

    QUnit.module('runTransform', function(hooks) {
      let userProject;

      hooks.beforeEach(async function() {
        // includes simple identifier reverser
        await execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

        userProject = await createTempDir();
        process.chdir(userProject.path());
      });

      hooks.afterEach(function() {
        return userProject.dispose();
      });

      QUnit.test('runs transform', async function(assert) {
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

      QUnit.test('runs transform with options', async function(assert) {
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

      QUnit.test('can specify additional extensions to run against', async function(assert) {
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

      QUnit.test('runs transform against class syntax', async function(assert) {
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

      QUnit.test('runs transform against decorator syntax', async function(assert) {
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
  });
});
