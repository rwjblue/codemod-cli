const path = require('path');
/*eslint-disable node/no-unpublished-require */
const createTempDir = require('broccoli-test-helper').createTempDir;
const wrap = require('co').wrap;
const execa = require('execa');
const walkSync = require('walk-sync');
/*eslint-enable*/

const EXECUTABLE_PATH = path.join(__dirname, '..', 'bin', 'cli.js');
const ROOT = process.cwd();

QUnit.module('codemod-cli', function(hooks) {
  let input, output;

  hooks.beforeEach(
    wrap(function*() {
      input = yield createTempDir();
      output = yield createTempDir();

      process.chdir(input.path());
    })
  );

  hooks.afterEach(
    wrap(function*() {
      yield input.dispose();
      yield output.dispose();

      process.chdir(ROOT);
    })
  );

  QUnit.module('new', function() {
    QUnit.test(
      'should generate a basic project structure',
      wrap(function*(assert) {
        let result = yield execa(EXECUTABLE_PATH, ['new', 'ember-qunit-codemod']);

        assert.equal(result.code, 0, 'exited with zero');
        assert.deepEqual(walkSync(input.path()), [
          'ember-qunit-codemod/',
          'ember-qunit-codemod/README.md',
          'ember-qunit-codemod/package.json',
          'ember-qunit-codemod/transforms/',
          'ember-qunit-codemod/transforms/.gitkeep',
        ]);
      })
    );
  });

  QUnit.module('generate', function(hooks) {
    let project;

    hooks.before(
      wrap(function*() {
        project = yield createTempDir();

        process.chdir(project.path());
        yield execa(EXECUTABLE_PATH, ['new', 'test-project']);

        process.chdir(ROOT);
      })
    );

    hooks.beforeEach(function() {
      input.copy(project.path('test-project'));
    });

    QUnit.module('codemod', function() {
      QUnit.test(
        'should generate a codemod',
        wrap(function*(assert) {
          let result = yield execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);

          assert.equal(result.code, 0, 'exited with zero');
          assert.deepEqual(walkSync(input.path('transforms')), [
            '.gitkeep',
            'main/',
            'main/README.md',
            'main/__testfixtures__/',
            'main/__testfixtures__/basic.input.js',
            'main/__testfixtures__/basic.output.js',
            'main/index.js',
            'main/test.js',
          ]);
        })
      );
    });

    QUnit.module('fixture', function() {
      QUnit.test(
        'should generate a fixture for the specified codemod',
        wrap(function*(assert) {
          yield execa(EXECUTABLE_PATH, ['generate', 'codemod', 'main']);
          let result = yield execa(EXECUTABLE_PATH, [
            'generate',
            'fixture',
            'main',
            'this-dot-owner',
          ]);

          assert.equal(result.code, 0, 'exited with zero');
          assert.deepEqual(walkSync(input.path('transforms')), [
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
        })
      );
    });
  });
});
