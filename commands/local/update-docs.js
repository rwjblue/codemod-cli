module.exports.command = 'update-docs';
module.exports.desc = 'Update the project README with current list of transforms';

function updateProjectREADME() {
  const fs = require('fs-extra');

  let TRANSFORMS_PLACE_HOLDER = /<!--TRANSFORMS_START-->[\s\S]*<!--TRANSFORMS_END-->/;

  let transforms = fs
    .readdirSync('transforms')
    .filter(file => fs.lstatSync(`transforms/${file}`).isDirectory());

  let readmeContent = transforms
    .map(name => `* [${name}](transforms/${name}/README.md)`)
    .join('\n');

  fs.writeFileSync(
    'README.md',
    fs
      .readFileSync('README.md', 'utf8')
      .replace(
        TRANSFORMS_PLACE_HOLDER,
        `<!--TRANSFORMS_START-->\n${readmeContent}\n<!--TRANSFORMS_END-->`
      )
  );
}

function updateTransformREADME(transformName) {
  const fs = require('fs-extra');
  const path = require('path');

  let toc = [];
  let details = [];

  let fixtureDir = `transforms/${transformName}/__testfixtures__`;

  if (!fs.existsSync(fixtureDir)) {
    // project does not include fixtures (perhaps using different testing
    // setup)
    return;
  }

  const testMap = fs.readdirSync(fixtureDir).reduce((_hash, filename) => {
    const extension = path.extname(filename);
    const validFilename = path.basename(filename).match(/input|output+(?=\.)/);
    if (!validFilename) {
      return _hash;
    }
    const testName = filename.slice(0, validFilename.index - 1);
    const testType = validFilename[0];

    if (!_hash[testName]) {
      _hash[testName] = {};
    }

    _hash[testName][testType] = `${testName}.${testType}${extension}`;

    return _hash;
  }, {});

  Object.entries(testMap).forEach(([testName, testPaths]) => {
    let inputExtension = path.extname(testPaths.input);
    let outputExtension = path.extname(testPaths.output);
    let inputPath = path.join(fixtureDir, testPaths.input);
    let outputPath = path.join(fixtureDir, testPaths.output);

    toc.push(`* [${testName}](#${testName})`);
    details.push(
      '---',
      `<a id="${testName}">**${testName}**</a>`,
      '',
      `**Input** (<small>[${testPaths.input}](${inputPath})</small>):`,
      '```' + inputExtension.slice(1),
      fs.readFileSync(inputPath),
      '```',
      '',
      `**Output** (<small>[${testPaths.output}](${outputPath})</small>):`,
      '```' + outputExtension.slice(1),
      fs.readFileSync(outputPath),
      '```'
    );
  });

  let transformREADMEPath = `transforms/${transformName}/README.md`;

  let FIXTURES_TOC_PLACE_HOLDER = /<!--FIXTURES_TOC_START-->[\s\S]*<!--FIXTURES_TOC_END-->/;
  let FIXTURES_CONTENT_PLACE_HOLDER = /<!--FIXTURES_CONTENT_START-->[\s\S]*<!--FIXTURE[S]?_CONTENT_END-->/;

  fs.writeFileSync(
    transformREADMEPath,
    fs
      .readFileSync(transformREADMEPath, 'utf8')
      .replace(
        FIXTURES_TOC_PLACE_HOLDER,
        `<!--FIXTURES_TOC_START-->\n${toc.join('\n')}\n<!--FIXTURES_TOC_END-->`
      )
      .replace(
        FIXTURES_CONTENT_PLACE_HOLDER,
        `<!--FIXTURES_CONTENT_START-->\n${details.join('\n')}\n<!--FIXTURES_CONTENT_END-->`
      )
  );
}

function updateTransformREADMEs() {
  const fs = require('fs-extra');

  fs.readdirSync('transforms')
    .filter(file => fs.lstatSync(`transforms/${file}`).isDirectory())
    .forEach(updateTransformREADME);
}

module.exports.handler = function handler() {
  updateProjectREADME();
  updateTransformREADMEs();
};
