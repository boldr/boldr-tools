/* eslint-disable no-var, prefer-arrow-callback, prefer-template, no-console */
var minNodeVersion = 6;

if (Number(process.versions.node.split('.')[0]) < minNodeVersion) {
  console.error('Boldr requires Node v' + minNodeVersion + 'or higher.');
  process.exit(1);
}
