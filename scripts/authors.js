const fs = require('fs');
const github = require('./github');
const minimist = require('minimist');
const os = require('os');
const packageJson = require('../package.json');

const args = process.argv.slice(2);
const options = minimist(args);

const repo = options.repo || packageJson.repository;
const format = options.format || 'text';
const outputFile = options['out-file'] || './AUTHORS';

function getContributors() {
  return github.get(`/repos/${repo}/contributors?per_page=100`, true).then((contributors) => {
    const promises = contributors.map((contributor) =>
    github.get(contributor.url).then((user) => contributor.user = user)); // eslint-disable-line

    return Promise.all(promises).then(() => contributors);
  });
}

function formatContributorsAsJson(contributors) {
  return JSON.stringify(contributors, null, 2);
}

function formatContributorsAsText(contributors) {
  return contributors.map((contributor) => {
    const { user } = contributor;
    const name = (user && user.name) ? user.name : contributor.login;
    const email = (user && user.email) ? user.email : null;
    const url = (user && user.html_url) ? user.html_url : contributor.html_url;

    if (email && url) {
      return `${name} <${email}> (${url})`;
    } else if (email) {
      return `${name} <${email}>`;
    } else if (url) {
      return `${name} (${url})`;
    } else {
      return `${name}`;
    }
  }).sort().join(os.EOL);
}

function outputContributors(contributors) {
  let output;

  switch (format) {
    case 'json':
      output = formatContributorsAsJson(contributors);
      break;

    case 'text':
      output = formatContributorsAsText(contributors);
      break;

    default:
      throw new Error(`Unknown format: ${format}`);
  }

  if (outputFile) {
    fs.writeFileSync(outputFile, output);
  } else {
    console.log(output);
  }
}

function handleError(error) {
  console.error(error);
  process.exit(1);
}

getContributors().then(outputContributors).catch(handleError);
