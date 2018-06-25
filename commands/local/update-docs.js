module.exports.command = 'update-docs';
module.exports.desc = 'Update the project README with current list of transforms';

module.exports.handler = function handler() {
  const fs = require('fs-extra');

  let TRANSFORMS_PLACE_HOLDER = /<!--TRANSFORMS_TABLE_START-->[\s\S]*<!--TRANSFORMS_TABLE_END-->/;

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
        `<!--TRANSFORMS_TABLE_START-->\n${readmeContent}\n<!--TRANSFORMS_TABLE_END-->`
      )
  );
};
