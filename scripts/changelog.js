/* eslint-disable max-len */
const fs = require('fs');
const os = require('os');
const path = require('path');
const minimist = require('minimist');
const packageJson = require('../package.json');
const github = require('./github');
const utilities = require('./utilities');

const args = process.argv.slice(2);
const options = minimist(args);

const repo = options.repo || packageJson.repository;
const format = options.format || 'markdown';
const outputFile = options['out-file'] || './CHANGELOG.md';
const packagesDir = options['pkg-dir'] || './packages';
const packageName = options['pkg-name'] || packageJson.name;
const tagFrom = options['tag-from'];
const tagTo = options['tag-to'];

const newlineSearch = /\n/g;
const newlineReplacement = '\n    ';
const commitIssueSearch = /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #(\d+)/gi;
const commitIssueReplacement = `$1 [#$2](https://github.com/${repo}/issues/$2)`;
const unreleasedTag = '___unreleased___';
const unlabeledLabel = '___unlabeled___';

const headings = {
  'change: new feature': '🚀  New Feature',
  'change: breaking change': '💥  Breaking Change',
  'change: bug fix': '🐛  Bug Fix',
  'change: enhancement': '🌟  Enhancement',
  'change: documentation': '📝  Documentation',
  'change: internal': '🏠  Internal',
  [unlabeledLabel]: '❓  Other',
};

function getCommits() {
  let tagRange;

  if (tagFrom && tagTo) {
    tagRange = `${tagFrom}..${tagTo}`;
  } else if (tagFrom) {
    tagRange = `${tagFrom}..`;
  } else if (tagTo) {
    tagRange = `${tagTo}`;
  } else {
    tagRange = '';
  }

  return utilities.exec(`git log --pretty="%H;%s;%D" --first-parent ${tagRange}`, { encoding: 'utf8' }).then((log) => {
    let tags;

    const promises = log.split('\n').filter((line) => line).map((line) => {
      const [sha, subject, refs] = line.split(';');
      const refTags = refs.split(', ').filter((ref) => ref.startsWith('tag: v')).map((ref) => ref.slice(5));

      if (refTags.length > 0) {
        tags = refTags;
      }

      const releaseTag = (tags) ? tags[0] : null;
      const issueNumberMatch = subject.match(/^Merge pull request #(\d+)/);
      const issueNumber = (issueNumberMatch) ? issueNumberMatch[1] : null;

      return github.get(`/repos/${repo}/commits/${sha}`).then((commit) => {
        const promises = [commit];

        if (releaseTag) {
          promises.push(github.get(`/repos/${repo}/releases/tags/${releaseTag}`));
        } else {
          promises.push(null);
        }

        if (issueNumber) {
          promises.push(github.get(`/repos/${repo}/issues/${issueNumber}`));
        } else {
          promises.push(null);
        }

        return Promise.all(promises);
      }, (error) => {
        console.warn(`Skipping commit ${sha}: Verify all local commits have been pushed to the remote repository.`);

        return [];
      }).then(([commit, release, issue]) => {
        if (commit) {
          commit.release = release;
          commit.issue = issue;
        }

        return commit;
      });
    });

    return Promise.all(promises).then((commits) => commits.filter((commit) => commit));
  });
}

function groupCommitsByRelease(commits) {
  const groups = commits.reduce((obj, commit) => {
    const { release } = commit;
    const key = (release) ? release.tag_name : unreleasedTag;

    if (!obj[key]) {
      obj[key] = { release,
        commits: [commit] };
    } else {
      obj[key].commits.push(commit);
    }

    return obj;
  }, {});

  return Object.keys(groups).map((key) => groups[key]);
}

function groupCommitsByLabel(commits) {
  const labels = Object.keys(headings);
  const groups = commits.reduce((obj, commit) => {
    labels.forEach((label) => {
      const key = label;

      if (key === unlabeledLabel && commit.issue && commit.issue.labels.some((label) => label.name in headings)) {
        return;
      } else if (key !== unlabeledLabel && (!commit.issue || !commit.issue.labels.some((label) => label.name === key))) {
        return;
      }

      if (!obj[key]) {
        obj[key] = { label,
          commits: [commit] };
      } else {
        obj[key].commits.push(commit);
      }
    });

    return obj;
  }, {});

  return Object.keys(groups).sort((a, b) => labels.indexOf(a) - labels.indexOf(b)).map((key) => groups[key]);
}

function groupCommitsByPackages(commits) {
  const packagesPath = path.resolve(packagesDir);
  const groups = commits.reduce((obj, commit) => {
    const packageNames = (commit.files.length > 0) ? commit.files.map((file) => {
      const filePath = path.resolve(file.filename);

      if (filePath.startsWith(packagesPath)) {
        return filePath.slice(packagesPath.length + 1).split(path.sep, 1)[0];
      } else {
        return packageName;
      }
    }) : [packageName];

    const packages = [...new Set(packageNames)].sort();
    const key = packages.toString();

    if (!obj[key]) {
      obj[key] = { packages,
        commits: [commit] };
    } else {
      obj[key].commits.push(commit);
    }

    return obj;
  }, {});

  return Object.keys(groups).sort().map((key) => groups[key]);
}

function formatCommitsAsJson(commits) {
  return JSON.stringify(commits, null, 2);
}

function formatCommitsAsMarkdown(commits) {
  let markdown = '# Changelog';

  groupCommitsByRelease(commits).forEach((obj) => {
    const releaseHeading = (obj.release) ? `${obj.release.name.trim()} - ${new Date(obj.release.published_at).toDateString()}` : '[RELEASE TITLE] - [RELEASE DATE]';
    const releaseBody = (obj.release) ? obj.release.body.trim() : '[RELEASE DESCRIPTION]';

    markdown += `${os.EOL}${os.EOL}## ${releaseHeading}`;

    if (releaseBody) {
      markdown += `${os.EOL}${os.EOL}> ${releaseBody}`;
    }

    groupCommitsByLabel(obj.commits).forEach((obj) => {
      const labelHeading = headings[obj.label];

      markdown += `${os.EOL}${os.EOL}### ${labelHeading}`;

      groupCommitsByPackages(obj.commits).forEach((obj) => {
        const packagesHeading = obj.packages.map((pkg) => `\`${pkg}\``).join(', ');

        markdown += `${os.EOL}${os.EOL}* ${packagesHeading}`;

        obj.commits.forEach((commit) => {
          const commitHeading = (commit.issue) ? `[#${commit.issue.number}](${commit.issue.html_url}) - ${commit.issue.title.replace(commitIssueSearch, commitIssueReplacement).replace(newlineSearch, newlineReplacement).trim()} ([@${commit.author.login}](${commit.author.html_url}))` : `${commit.commit.message.replace(commitIssueSearch, commitIssueReplacement).replace(newlineSearch, newlineReplacement).trim()} ([@${commit.author.login}](${commit.author.html_url}))`;
          const commitBody = (commit.issue) ? commit.issue.body.replace(commitIssueSearch, commitIssueReplacement).replace(newlineSearch, newlineReplacement).trim() : null;

          markdown += `${os.EOL}${os.EOL}  * ${commitHeading}`;

          if (commitBody) {
            markdown += `${os.EOL}${os.EOL}    ${commitBody}`;
          }
        });
      });
    });
  });

  return markdown;
}

function outputCommits(commits) {
  let output;

  switch (format) {
    case 'json':
      output = formatCommitsAsJson(commits);
      break;

    case 'markdown':
      output = formatCommitsAsMarkdown(commits);
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

getCommits().then(outputCommits).catch(handleError);
