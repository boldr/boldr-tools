const chalk = require('chalk');
const changeCase = require('change-case');

const allowedNameTransforms = {
  camelCase: true,
  constantCase: true,
  headerCase: true,
  paramCase: true,
  pascalCase: true,
  snakeCase: true,
};

/**
 * @param {String} str
 * @param {String} transFn;

 */
function transformCase(str, transFn = 'pascalCase') {
  if (!allowedNameTransforms.hasOwnProperty(transFn)) {
    const message = `Invalid transform, allowed transform functions are:\n
    ${Object.keys(allowedNameTransforms).join(', ')}]`;
    throw new Error(message);
  }
  return changeCase[transFn](str);
}

export default transformCase;
