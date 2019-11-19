# codemod-cli

codemod-cli is a command line tool for generating, testing, and publishing codemods.

## Installation

```
npm install --global codemod-cli

# OR

yarn global add codemod-cli
```

## Usage

The `codemod-cli` workflow is focused on managing a group of codemods.

To get started you first need a project. You can generate a new codemod-cli project via:

```
codemod-cli new <project-name>
```

This will create a small project structure (`README.md`, `package.json`, etc) which is
ready to help you manage your codemods.

You can also import from ast-explorer to create a codemod project via:

```
codemod-cli new <project-name> --url <ast-explorer-url> --codemod <codemod-name>
```

Once you have a project, you can generate a new codemod:

```
codemod-cli generate codemod <name of codemod>
```

This will setup a new jscodeshift codemod within your project at `transforms/<name of codemod>/index.js`
along with a test harness, README, fixture directory, and an initial set of input/output fixtures.

Once you have tweaked your codemod and its fixtures to your liking, it is time to run your tests:

```
codemod-cli test
```

As you develop your codemod you may need additional fixtures (e.g. to test various combinations of
inputs). To generate a new fixture, run the following:

```
codemod-cli generate fixture <name of codemod> <name of fixture>
```

This sets up two new files in `transforms/<name of codemod>/__testfixtures__/` using the fixture name
you provided. These fixtures are used by the testing harness to verify that your codemod is working properly.

Once you have things just how you like them with your new codemod (and your tests are passing :wink:) you
can update your project's README and your transforms README via:

```
codemod-cli update-docs
```

### File Types

By default the bin script that is generated for your `codemod-cli` project will run against `.js` and `.ts` files.
If you'd like to change that (e.g. to run against `.hbs` or `.jsx` files) you can tweak your projects `bin/cli.js` script
to add `--extensions=hbs,jsx`:

```js
#!/usr/bin/env node
'use strict';

require('codemod-cli').runTransform(
  __dirname,
  process.argv[2],       /* transform name */,
  process.argv.slice(3), /* paths or globs */
  'hbs,jsx'
)
```

## Debugging Workflow
Oftentimes, you want to debug the codemod or the transform to identify issues with the code or to understand
how the transforms are working, or to troubleshoot why some tests are failing. 

Hence we recommend a debugging work-flow like below to quickly find out what is causing the issue.

### 1. Place `debugger` statements
Add `debugger` statements, in appropriate places in the code. For example:

```js
...
const params = a.value.params.map(p => {
  debugger;
  if(p.type === "SubExpression") {
    return transformNestedSubExpression(p)
...
```

### 2. Inspect the process with node debug
Here we are going to start the tests selectively in node debug mode. Since the
codemod is bootstrapped using [codemod-cli](https://github.com/rwjblue/codemod-cli) which is using [jest](https://jestjs.io/) in turn
to run the tests, jest is having an option `-t <name-of-spec>` to run a particular 
set of tests instead of running the whole test suite.

We are making use of both these features to start our tests in this particular fashion.
For more details on node debug, visit the [official](https://nodejs.org/en/docs/guides/debugging-getting-started/) 
Node.js debugging guide, and for jest documentation on tests, [here](https://jestjs.io/docs/en/cli)

```sh
node --inspect-brk ./node_modules/.bin/codemod-cli -t '<fixture-name>'
```

For example, if you want to debug the `null-subexp.input.hbs` fixture or only that particular test case is failing
because of an issue.

```sh
node --inspect-brk ./node_modules/.bin/codemod-cli -t 'null-subexp'
```

Sometimes we need to use `--runInBand` flag for the debugger statements to be hit when focusing the test with jest 

For example:

```sh
node --inspect-brk ./node_modules/.bin/jest --testNamePattern "ember-concurrency transforms correctly" --runInBand
```

Once you run the above command, your tests will start running in debug mode and your breakpoints will be
triggered appropriately when that particular block of code gets executed. You can run the debugger inside
Chrome browser dev-tools. More details on [here](https://developers.google.com/web/tools/chrome-devtools/javascript/)

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone git@github.com:rwjblue/codemod-cli.git`
* `cd codemod-cli`
* `yarn`

### Linting

* `yarn lint:js`
* `yarn lint:js --fix`

### Running tests

* `yarn test`

## License

This project is licensed under the [MIT License](LICENSE).
