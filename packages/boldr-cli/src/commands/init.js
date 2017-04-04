/* eslint-disable max-lines, max-statements, camelcase */

const path = require('path');
const fs = require('fs-extra');
const ora = require('ora');
const shell = require('shelljs');
const inquire = require('inquirer');
const uniq = require('lodash.uniq');
const simpleGit = require('simple-git')();
const semver = require('semver');
const { logger } = require('boldr-utils');

const cliPkgJson = require('../../package.json');
const projectList = require('../lib/projects');
const spinner = require('../lib/spinner');
const doesYarnExist = require('../lib/doesYarnExist')();
const writeEditorConfig = require('../writers/writeEditorConfig');
const writeBoldrConfigs = require('../writers/writeBoldrConfigs');
const writeStylelint = require('../writers/writeStylelint');
const writeEslint = require('../writers/writeEslint');
const writeGitIgnore = require('../writers/writeGitIgnore');
const writeDllConfig = require('../writers/writeDllConfig');
const writeMapCoverage = require('../writers/writeMapCoverage');

const ROOT_DIR = process.cwd();
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const BOLDR_CFG_DIR = path.resolve(ROOT_DIR, '.boldr', 'boldr.config.js');

function resolveApp(relativePath) {
  return path.resolve(ROOT_DIR, relativePath);
}

module.exports = (options, args) => {
  logger.start('Initializing your new Boldr project.');
  shell.config.silent = true;
  const emptyPkg = {
    name: '',
    version: '0.1.0',
    description: '',
    main: '',
    author: '',
    license: '',
  };

  const date = Date.now();

  let paths = {}; // eslint-disable-line
  let tmpProject, ypm, tmpPkgJson, oldPkgJson, tmpDir;
  let repoURL = 'https://github.com/boldr/getBoldr.git';
  let { localPath } = args;
  const nukeTmp = () => shell.rm('-rf', tmpProject);

  const gtfo = error => {
    logger.error(`Shit broke while setting up: ${repoURL}`);
    if (error) {
      logger.log(error);
    }
    nukeTmp();
    process.exit();
  };
  const verifyProjBoldrDxVer = userPkgJson => {
    const boldrPackPrefVer = (tmpPkgJson.dependencies && tmpPkgJson.dependencies['boldr-dx']) ||
      (tmpPkgJson.devDependencies && tmpPkgJson.devDependencies['boldr-dx']) ||
      null;

    if (boldrPackPrefVer) {
      // Look everywhere for boldr
      const boldrDxVersion = (userPkgJson.devDependencies && userPkgJson.devDependencies['boldr-dx']) ||
        (userPkgJson.dependencies && userPkgJson.dependencies['boldr-dx']);
      if (semver.valid(boldrDxVersion)) {
        if (!semver.satisfies(boldrDxVersion, boldrPackPrefVer)) {
          // eslint-disable-next-line max-len
          logger.warn(
            `${tmpPkgJson.name} requires boldr-dx version
              ${boldrPackPrefVer} but boldr-dx ${boldrDxVersion} is installed.`,
          );
        }
      }
    }
    return boldrPackPrefVer;
  };

  // Add boldr-dx to list of dev dependencies if its not there
  function writeBoldrDxToPkg(packageJson, boldrDxPrefVer) {
    // check to see if boldr-dx is in dependencies or devDependencies
    if (
      !(packageJson.dependencies && packageJson.dependencies['boldr-dx']) &&
      !(packageJson.devDependencies && packageJson.devDependencies['boldr-dx'])
    ) {
      let boldrDxVersion = boldrDxPrefVer;
      // If a version wasn't specified, install latest
      if (!boldrDxVersion) {
        const output = shell.exec('npm info boldr-dx version');
        boldrDxVersion = output.stdout.trim();
      }
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies['boldr-dx'] = boldrDxVersion;
    }
  }

  // Adds dependencies from the boldr-packs package.json
  function updatePkgDependencies(packageJson) {
    const tempDependencies = tmpPkgJson.dependencies || {};
    const tempDevDependencies = tmpPkgJson.devDependencies || {};
    if (tempDependencies['boldr-dx']) {
      Reflect.deleteProperty(tempDependencies, 'boldr-dx');
    }
    if (tempDevDependencies['boldr-dx']) {
      Reflect.deleteProperty(tempDevDependencies, 'boldr-dx');
    }

    packageJson.dependencies = Object.assign(packageJson.dependencies || {}, tempDependencies);

    // Copies over dev dependencies
    if (tempDevDependencies) {
      packageJson.devDependencies = Object.assign(packageJson.devDependencies || {}, tempDevDependencies);
    }

    logger.task('Added new dependencies to package.json');
    return packageJson;
  }

  /**
   * Adds Boldr-DX scripts to the package.json.
   * @method addNpmScripts
   * @param  {Object}      packageJson The package.json file.
   */
  function addNpmScripts(packageJson) {
    if (!packageJson.scripts) packageJson.scripts = {};
    let commands = [
      'dev',
      'build',
      'start',
      'test',
      'test:watch',
      'test:coverage',
      'test:browser',
      'test:node',
      'lint',
      'lint:js',
      'lint:css',
    ];

    // for commands that aren't 1:1 name:script
    const commandMap = {
      start: 'node compiled/main.js',
      'test:watch': 'boldr-dx test -- --watch',
      'test:browser': 'boldr-dx test',
      'test:node': 'boldr-dx test:node',
      'lint:js': 'boldr-dx lint:js',
      'lint:css': 'boldr-dx lint:css',
      lint: 'npm run lint:js && npm run lint:css',
    };

    // Merge the boldr-pack script names into the list of commands.
    const tempScripts = (tmpPkgJson && tmpPkgJson['boldr-dx'] && tmpPkgJson['boldr-dx'].scripts) || [];
    if (tempScripts.length) {
      commands = uniq(commands.concat(tempScripts));
    }

    const npmMissingTests = 'echo "Error: no test specified" && exit 1';

    commands.forEach(command => {
      let commandName = command;

      // If the command already exists, we namespace it with "boldr-dx:".
      if (packageJson.scripts[commandName]) {
        // We don't need to prefix if the command already
        // runs boldr-dx and it's not a boldr-pack script.
        if (packageJson.scripts[commandName].includes('boldr-dx') && !tempScripts.indexOf(command)) {
          return;
        }

        // Prefix except for when the command is 'test' and the script is
        // the default from 'npm init'.
        if (commandName !== 'test' || packageJson.scripts[commandName] !== npmMissingTests) {
          commandName = `boldr-dx:${commandName}`;
        }
      }

      // If the command is copied from a boldr project then
      // we need to copy in the boldr-dx value.
      if (tempScripts.indexOf(command) > -1) {
        packageJson.scripts[commandName] = tmpPkgJson.scripts[command];
      } else {
        packageJson.scripts[commandName] = commandMap[command] || `boldr-dx ${command}`;
      }
    });
    packageJson.scripts['boldr-dx:help'] = 'boldr-dx --help';
    logger.task('Added boldr-dx scripts into your package.json scripts');
    return packageJson;
  }

  /**
   * Write Boldr-DX scripts to the package.json
   * @method editUserPkg
   * @param  {Boolean}    existingProject Whether or not we're installing to an existing project.
   */
  function editUserPkg(existingProject) {
    shell.exec('pwd');
    let userPkgJson;
    // Create a package.json if the user doesn't already have one.
    if (shell.test('-f', path.resolve(ROOT_DIR, 'package.json'))) {
      userPkgJson = require(path.resolve(ROOT_DIR, 'package.json'));
    } else {
      userPkgJson = emptyPkg;
      logger.task('Creating a new package.json. Dont forget to fill it out.');
    }
    // Clone the package.json so that we have a backup.
    oldPkgJson = Object.assign({}, userPkgJson);

    // Add dependencies from boldr-packs
    if (!existingProject) {
      const boldrDxPrefVer = args.boldrDxVersion || verifyProjBoldrDxVer(userPkgJson);
      userPkgJson = updatePkgDependencies(userPkgJson);
      writeBoldrDxToPkg(userPkgJson, boldrDxPrefVer);
    } else {
      // exisitng projects should also have boldr-dx as a devDependency
      writeBoldrDxToPkg(userPkgJson);
    }
    // Add scripts
    userPkgJson = addNpmScripts(userPkgJson);
    fs.writeFileSync(path.resolve(ROOT_DIR, 'package.json'), JSON.stringify(userPkgJson, null, 2));
  }

  // Cleans and reinstalls node modules.
  function cleanInstall() {
    spinner.start();
    logger.info('Cleaning node modules and reinstalling. This may take a couple of minutes...');
    const result = shell.exec(`rm -rf ${resolveApp('node_modules')} && ${ypm} install`);
    if (result.code !== 0) {
      fs.writeFileSync(path.resolve(ROOT_DIR, 'package.json'), JSON.stringify(oldPkgJson, null, 2));
      logger.error('An error occurred when trying to install node modules', result.stderr);
      logger.task('Restored the original package.json and bailing');
      logger.info('You may need to reinstall your modules');
      spinner.failure();
      gtfo();
    }
    logger.task('Installed new modules');
    spinner.succeed();
  }

  // Create the src directory for Boldr.
  function createSrcDirectory() {
    const copySrcDir = () => {
      const tmpSRC_DIR = path.join(tmpDir, '/src');
      shell.cp('-r', `${tmpSRC_DIR}`, ROOT_DIR);
      logger.task('Created src directory');
    };

    // Check if a src directory is already in place. If so, copy it.
    if (shell.test('-d', resolveApp('src'))) {
      const mvTo = path.join(ROOT_DIR, `src-${date}-bak`);
      shell.mv('-f', resolveApp('src'), mvTo);
      logger.info(`Backed up existing src directory to: ${mvTo}`);
    }

    copySrcDir();
  }

  const copyBaseBoldrFiles = () => {
    const boldrPackFiles = (tmpPkgJson['boldr-dx'] && tmpPkgJson['boldr-dx'].files) || [];
    if (boldrPackFiles.length) {
      boldrPackFiles.forEach(file => {
        const tempFilePath = path.join(tmpDir, file);
        const filePath = path.join(ROOT_DIR, file);
        // Check if these exist. If they do, copy them to the backup directory
        // After they are moved, delete them.
        if (
          ['.gitignore', '.stylelintrc', '.eslintrc', '.editorconfig', '.boldr/boldr.config.js'].indexOf(file) === -1 &&
          (shell.test('-f', filePath) || shell.test('-d', filePath))
        ) {
          const fileBackup = path.join(ROOT_DIR, `${file}-${date}-bak`);
          shell.mv(filePath, fileBackup);
          logger.info(`Backed up ${file} to: ${fileBackup}`);
        }
        // Copy our base files to the project root directory.
        shell.cp('-Rf', tempFilePath, ROOT_DIR);
        logger.task(`Copied ${file} from the base boldr project.`);
      });
    }
  };

  /**
   * Setup a new Boldr project.
   * @method boldrProjectSetup
   * @param  {String}          projectKind the type of project to create
   */
  function boldrProjectSetup(projectKind) {
    let pkgName = null;
    if (projectKind) {
      tmpDir = path.join(tmpDir, projectList.available[projectKind].path);
      pkgName = projectList.available[projectKind].pkgName; // eslint-disable-line
    }

    const boldrprojectKind = projectKind || localPath || repoURL;
    projectKind = projectKind || 'defined';
    logger.task(`Initializing ${projectKind} Boldr project.`);
    spinner.start();
    const handleFileWriting = error => {
      if (error) {
        logger.error('There was a problem downloading the Boldr installation.');
        logger.log(error);
        gtfo();
        spinner.failure();
      }
      tmpPkgJson = require(`${tmpDir}/package.json`);
      editUserPkg(false);
      cleanInstall();
      writeEslint();
      writeStylelint();
      writeEditorConfig();
      writeBoldrConfigs(tmpDir);
      writeDllConfig(tmpDir);
      writeMapCoverage(tmpDir);
      createSrcDirectory();
      writeGitIgnore();
      copyBaseBoldrFiles();
      nukeTmp();
      logger.end(`Finished setup for: ${boldrprojectKind}  ✨`);
      spinner.succeed();
    };
    // Cleanup our old leftovers.
    nukeTmp();

    if (localPath) {
      shell.exec(`cp -R ${localPath} ${tmpProject}`);
      handleFileWriting();
    } else if (pkgName) {
      shell.mkdir(tmpProject);
      shell.cd(tmpProject);
      const fakePkgPath = `${tmpProject}/package.json`;
      fs.writeFileSync(fakePkgPath, JSON.stringify(emptyPkg, null, 2));

      let installCmd = 'npm install';
      if (ypm === 'yarn') {
        installCmd = 'yarn add';
      }

      const output = shell.exec(`${installCmd} ${pkgName}`);
      if (output.code !== 0) {
        throw output.stderr;
      }
      shell.cd('..');
      handleFileWriting();
    } else {
      simpleGit.clone(repoURL, tmpProject, {}, handleFileWriting);
    }
  }
  // Checks to see if user would like src backed up before continuing
  function askToBackupSrc(projectChoice) {
    // Check src directory at process.cwd()/src
    // if it's found, ask about backing it up.
    if (shell.test('-d', SRC_DIR)) {
      const question = [
        {
          type: 'confirm',
          name: 'srcBackup',
          message: 'Found a prexisting src directory. Should we back it up and continue? Or exit?', // eslint-disable-line
          default: true,
        },
      ];
      inquire.prompt(question).then(answer => {
        if (answer.srcBackup) {
          boldrProjectSetup(projectChoice);
        } else {
          process.exit(1);
        }
      });
    } else {
      boldrProjectSetup(projectChoice);
    }
  }

  const existingProjectSetup = () => {
    logger.start('Setting up Boldr');
    spinner.start();
    editUserPkg(true);
    writeEditorConfig();
    writeEslint();
    writeStylelint();
    writeBoldrConfigs();
    writeDllConfig();
    writeMapCoverage();
    writeGitIgnore();
    logger.end('Done setting up Boldr for BoldrDX use only.');
    spinner.succeed();
  };

  const getRepoUrl = repositoryArg => {
    if (repositoryArg) {
      repoURL = repositoryArg;
      askToBackupSrc();
    } else {
      const question = [
        {
          type: 'input',
          name: 'repoUrl',
          message: 'Enter a git repository URL (https or ssh)',
          validate: answer => {
            const isValidHttps = answer.match(/^https:\/\/.*.git$/);
            const isValidSsh = answer.match(/^git@github.com:.*.git$/);
            if (isValidHttps || isValidSsh) {
              return true;
            }
            return 'Please enter a valid repo url';
          },
        },
      ];
      inquire.prompt(question).then(answer => {
        if (answer.repoUrl !== '') {
          repoURL = answer.repoUrl;
          askToBackupSrc();
        } else {
          logger.error('Please enter a valid url.');
          process.exit(1);
        }
      });
    }
  };


  const makeDir = dirName => {
    if (dirName === '') return;
    const verifyExit = code => {
      if (code) {
        logger.error(`Unable to create directory ${dirName}. Exiting...`);
        process.exit(1);
      }
    };
    // Creates project directory if one is specified
    logger.task(`Creating your new project at ${dirName}`);

    let output = shell.mkdir(dirName);
    verifyExit(output.code);

    output = shell.cd(dirName);
    verifyExit(output.code);
  };

  const defineTemportyPaths = () => {
    tmpProject = path.resolve(process.cwd(), '.boldrdx-tmp'); // eslint-disable-line no-useless-escape
    tmpDir = tmpProject;
    repoURL = 'https://github.com/boldr/getBoldr.git';
  };

  const askProjectSetupQs = () => {
    const boldrProjectList = Object.keys(projectList.available);
    const ownRepo = "I'll pass in my own custom url.";
    const noneExist = "I don't want to use an existing Boldr project.";
    boldrProjectList.push(ownRepo);
    boldrProjectList.push(noneExist);

    const pkgManagerQuestion = {
      type: 'list',
      name: 'ypm',
      message: 'Which package manager should we use?',
      choices: ['yarn', 'npm'],
      default: 0,
    };
    const installationDirQuestion = {
      type: 'input',
      name: 'dirName',
      message: 'Enter a new directory name. To install in current directory, leave blank.',
    };

    const boldrProjectTypeQuestion = {
      type: 'list',
      name: 'projectChoice',
      message: 'Choose a Boldr project', // eslint-disable-line
      choices: boldrProjectList,
      default: 0,
    };
    const questions = [];

    // Check to see if yarn is installed or if the user has specified the yarn flag
    if (doesYarnExist === 'yarn' && !args.packageManager) {
      questions.push(pkgManagerQuestion);
    }

    ypm = args.packageManager ? args.packageManager : doesYarnExist;

    if (!args.directory) {
      questions.push(installationDirQuestion);
    }
    if (!args.repository && !localPath) {
      questions.push(boldrProjectTypeQuestion);
    }

    inquire.prompt(questions).then(answer => {
      // Question 1: Package manager
      ypm = answer.ypm || ypm;
      // Question 2: Directory
      // Save Local directory Path before moving to new directory
      if (localPath) {
        localPath = path.resolve(localPath);
      }
      // Create new directory
      makeDir(args.directory || answer.dirName);
      // Get our temporary folder names and paths
      defineTemportyPaths();
      // question 3
      const choice = answer.projectChoice;
      if (choice === ownRepo || args.repository) {
        // prompt for the user's git repository input.
        getRepoUrl(args.repository);
      } else if (projectList.available[choice] || localPath) {
        askToBackupSrc(choice);
      } else if (choice === noneExist) {
        existingProjectSetup();
      }
    });
  };

  try {
    askProjectSetupQs();
  } catch (err) {
    gtfo(err);
  }
};
