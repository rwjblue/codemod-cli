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

  fs.readdirSync(fixtureDir)
    .filter(filename => /\.input$/.test(path.basename(filename, path.extname(filename))))
    .forEach(filename => {
      let extension = path.extname(filename);
      let testName = filename.replace(`.input${extension}`, '');
      let inputPath = path.join(fixtureDir, `${testName}.input${extension}`);
      let outputPath = path.join(fixtureDir, `${testName}.output${extension}`);

      toc.push(`* [${testName}](#${testName})`);
      details.push(
        '---',
        `<a id="${testName}">**${testName}**</a>`,
        '',
        `**Input** (<small>[${testName}.input${extension}](${inputPath})</small>):`,
        '```' + extension.slice(1),
        fs.readFileSync(inputPath),
        '```',
        '',
        `**Output** (<small>[${testName}.output${extension}](${outputPath})</small>):`,
        '```' + extension.slice(1),
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
