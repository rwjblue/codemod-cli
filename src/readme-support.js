'use strict';

const { stripIndent } = require('common-tags');

function projectReadme(projectName) {
  return stripIndent`
      # ${projectName}\n

      A collection of codemod's for ${projectName}.

      ## Usage

      To run a specific codemod from this project, you would run the following:

      \`\`\`
      npx ${projectName} <TRANSFORM NAME> path/of/files/ or/some**/*glob.js

      # or

      yarn global add ${projectName}
      ${projectName} <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
      \`\`\`

      ## Transforms

      <!--TRANSFORMS_START-->
      <!--TRANSFORMS_END-->

      ## Contributing

      ### Installation

      * clone the repo
      * change into the repo directory
      * \`yarn\`

      ### Running tests

      * \`yarn test\`

      ### Update Documentation

      * \`yarn update-docs\`
    `;
}

function codemodReadme(projectName, codemodName) {
  return stripIndent`
    # ${codemodName}\n

    ## Usage

    \`\`\`
    npx ${projectName} ${codemodName} path/of/files/ or/some**/*glob.js

    # or

    yarn global add ${projectName}
    ${projectName} ${codemodName} path/of/files/ or/some**/*glob.js
    \`\`\`

    ## Input / Output

    <!--FIXTURES_TOC_START-->
    <!--FIXTURES_TOC_END-->

    <!--FIXTURES_CONTENT_START-->
    <!--FIXTURES_CONTENT_END-->
  `;
}

module.exports = {
  codemodReadme,
  projectReadme,
};
