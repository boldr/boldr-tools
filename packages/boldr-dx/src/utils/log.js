import chalk from 'chalk';

export const chalkError = chalk.bold.red;
export const chalkSuccess = chalk.green;
export const chalkWarning = chalk.yellow;
export const chalkInfo = chalk.cyan;

export function log(msg) {
  console.log(`✨  => ${msg}`);
}

export function logError(msg) {
  console.log(chalkError(`💥  => ${msg}`));
}

export function logWarning(msg) {
  console.log(chalkWarning(`⚠️  => ${msg}`));
}

export function logSuccess(msg) {
  console.log(chalkSuccess(`👌  => ${msg}`));
}
