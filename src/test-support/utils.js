'use strict';

function transformDetails(options) {
  let root = process.cwd() + `/transforms/${options.name}/`;

  return {
    name: options.name,
    root,
    transformPath: root + 'index',
    fixtureDir: root + '__testfixtures__/',
  };
}

module.exports = {
  transformDetails,
};
