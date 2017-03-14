/* eslint-disable camelcase */
const childProcess = require('child_process');
const github = require('./github');
const minimist = require('minimist');
const packageJson = require('../package.json');
const utilities = require('./utilities');

const args = process.argv.slice(2);
const options = minimist(args);

const repo = options.repo || packageJson.repository;
const version = options.version || packageJson.version;

if (!version) {
  throw new Error('Version required.');
}

function checkStatus() {
  return utilities.exec('git status --porcelain', { encoding: 'utf8' }).then((status) => {
    if (status) {
      throw new Error('Your git status is not clean.');
    }
  });
}

function updateAuthors() {
  return childProcess.execSync('npm run authors', { encoding: 'utf8',
    stdio: 'inherit' });
}

function updateChangelog() {
  return childProcess.execSync('npm run changelog', { encoding: 'utf8',
    stdio: 'inherit' });
}

function publishPackages() {
  return childProcess.execSync('npm run publish', { encoding: 'utf8',
    stdio: 'inherit' });
}

function createRelease(content) {
  // See https://developer.github.com/v3/repos/releases/#create-a-release
  const payload = {
    tag_name: 'v0.0.6',
    target_commitish: 'master',
    name: 'Test Release v0.0.6',
    body: 'The body of the release...',
    draft: false,
    prerelease: false,
  };

  return github.post(`/repos/${repo}/releases`, payload);
}

function handleError(error) {
  console.error(error);
  process.exit(1);
}

// checkStatus()
//   .then(updateAuthors)
//   .then(updateChangelog)
//   .then(publishPackages)
//   .then(createRelease)
//   .catch(handleError);
