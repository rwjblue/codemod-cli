## v3.1.2 (2021-02-17)

#### :bug: Bug Fix
* [#156](https://github.com/rwjblue/codemod-cli/pull/156) Ensure the correct `ember-template-recast` command is found for template based codemods ([@zhanwang626](https://github.com/zhanwang626))

#### :house: Internal
* [#158](https://github.com/rwjblue/codemod-cli/pull/158) Remove macOS-latest from GitHub Actions config. ([@rwjblue](https://github.com/rwjblue))
* [#157](https://github.com/rwjblue/codemod-cli/pull/157) Update dependencies to latest ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Zhan Wang ([@zhanwang626](https://github.com/zhanwang626))


## v3.1.1 (2020-12-01)

#### :bug: Bug Fix
* [#128](https://github.com/rwjblue/codemod-cli/pull/128) Added some more default options for jscodeshift command line args ([@jwlawrence](https://github.com/jwlawrence))

#### Committers: 1
- Joshua Lawrence ([@jwlawrence](https://github.com/jwlawrence))


## v3.1.0 (2020-10-29)

#### :rocket: Enhancement
* [#95](https://github.com/rwjblue/codemod-cli/pull/95) Remove .travis.yml from newly generated projects. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#121](https://github.com/rwjblue/codemod-cli/pull/121) Updated `update-docs` command to respect mixed file type extensions ([@jwlawrence](https://github.com/jwlawrence))
* [#94](https://github.com/rwjblue/codemod-cli/pull/94) Fixup GH Actions configuration for new projects. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#118](https://github.com/rwjblue/codemod-cli/pull/118) Add some docs on how to generate template codemods ([@patocallaghan](https://github.com/patocallaghan))

#### Committers: 3
- Joshua Lawrence ([@jwlawrence](https://github.com/jwlawrence))
- Pat O'Callaghan ([@patocallaghan](https://github.com/patocallaghan))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v3.0.0 (2020-08-04)

#### :boom: Breaking Change
* [#91](https://github.com/rwjblue/codemod-cli/pull/91) Drop support for Node 13 ([@rwjblue](https://github.com/rwjblue))
* [#83](https://github.com/rwjblue/codemod-cli/pull/83) Drop node 8 ([@simonihmig](https://github.com/simonihmig))

#### :rocket: Enhancement
* [#89](https://github.com/rwjblue/codemod-cli/pull/89) Added support for accepting `jscodeshift` ignore options (e.g. `--ignore-config` and `--ignore-pattern`) ([@vinomanick](https://github.com/vinomanick))
* [#81](https://github.com/rwjblue/codemod-cli/pull/81) Add support for template codemods ([@simonihmig](https://github.com/simonihmig))

#### :memo: Documentation
* [#80](https://github.com/rwjblue/codemod-cli/pull/80) Fix "Debugging Workflow" examples ([@ro0gr](https://github.com/ro0gr))
* [#78](https://github.com/rwjblue/codemod-cli/pull/78) [docs] Update the readme blueprint for local usage ([@jsturgis](https://github.com/jsturgis))
* [#73](https://github.com/rwjblue/codemod-cli/pull/73) [DOCS] Add debugging workflow info docs ([@rajasegar](https://github.com/rajasegar))

#### :house: Internal
* [#90](https://github.com/rwjblue/codemod-cli/pull/90) Update automated release steps ([@rwjblue](https://github.com/rwjblue))
* [#87](https://github.com/rwjblue/codemod-cli/pull/87) Add node 14 to test matrix ([@simonihmig](https://github.com/simonihmig))

#### Committers: 7
- Jeff Sturgis ([@jsturgis](https://github.com/jsturgis))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Rajasegar Chandran ([@rajasegar](https://github.com/rajasegar))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Ruslan Hrabovyi ([@ro0gr](https://github.com/ro0gr))
- Simon Ihmig ([@simonihmig](https://github.com/simonihmig))
- Vinodh Kumar ([@vinomanick](https://github.com/vinomanick))


## v2.1.0 (2019-09-23)

#### :rocket: Enhancement
* [#71](https://github.com/rwjblue/codemod-cli/pull/71) Add GH Actions Workflow setup to new projects. ([@rwjblue](https://github.com/rwjblue))
* [#67](https://github.com/rwjblue/codemod-cli/pull/67) Add linting setup to new projects. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#70](https://github.com/rwjblue/codemod-cli/pull/70) Remove TravisCI setup. ([@rwjblue](https://github.com/rwjblue))
* [#69](https://github.com/rwjblue/codemod-cli/pull/69) Add GH Actions CI. ([@rwjblue](https://github.com/rwjblue))
* [#68](https://github.com/rwjblue/codemod-cli/pull/68) Update dependencies to latest versions. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v2.0.0 (2019-08-16)

#### :boom: Breaking Change
* [#64](https://github.com/rwjblue/codemod-cli/pull/64) Removes `input` suffix from the path indicated during a test ([@pzuraq](https://github.com/pzuraq))

#### :rocket: Enhancement
* [#63](https://github.com/rwjblue/codemod-cli/pull/63) Use indicated transform extensions to filter files to be processed ([@dcyriller](https://github.com/dcyriller))

#### Committers: 2
- Chris Garrett ([@pzuraq](https://github.com/pzuraq))
- Cyrille David ([@dcyriller](https://github.com/dcyriller))

## v1.1.0 (2019-07-09)

#### :rocket: Enhancement
* [#62](https://github.com/rwjblue/codemod-cli/pull/62) Add support for custom file extensions ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- L. Preston Sego III ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

## v1.0.0 (2019-06-17)

#### :boom: Breaking Change
* [#61](https://github.com/rwjblue/codemod-cli/pull/61) Drop support for Node 6 and 11. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v0.2.12 (2019-06-17)

#### :rocket: Enhancement
* [#60](https://github.com/rwjblue/codemod-cli/pull/60) Add `.gitignore` when creating new codemod project ([@mfeckie](https://github.com/mfeckie))

#### Committers: 1
- Martin Feckie ([@mfeckie](https://github.com/mfeckie))

## v0.2.11 (2019-04-30)

#### :rocket: Enhancement
* [#59](https://github.com/rwjblue/codemod-cli/pull/59) Add coverage statistics setup to new project blueprint ([@rajasegar](https://github.com/rajasegar))

#### Committers: 1
- Rajasegar Chandran ([@rajasegar](https://github.com/rajasegar))

## v0.2.10 (2019-02-15)

#### :rocket: Enhancement
* [#57](https://github.com/rwjblue/codemod-cli/pull/57) Update dependencies to latest versions. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#56](https://github.com/rwjblue/codemod-cli/pull/56) Do not assume transform files are `.js` ([@eventualbuddha](https://github.com/eventualbuddha))

#### Committers: 2
- Brian Donovan ([@eventualbuddha](https://github.com/eventualbuddha))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

