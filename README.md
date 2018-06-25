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
