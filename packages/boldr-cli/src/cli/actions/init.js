/* eslint-disable object-curly-newline */
/* eslint-disable max-statements */
/* eslint-disable max-lines */
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const uniq = require('lodash.uniq');
const inquire = require('inquirer');
const simpleGit = require('simple-git')();
const semver = require('semver');

const cliPkgJson = require('../../../package.json');
const boldrProject = require('../../config/boldrProjects');
const logger = require('../../utils/logger');
const yarnOrNpm = require('../../utils/yarnOrNpm')();

const ROOT_DIR = process.cwd();
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const BOLDR_CFG_DIR = path.resolve(ROOT_DIR, '.boldr', 'boldr.config.js');

module.exports = (flags, args) => {
  logger.start("Let's initialize your Boldr project...");
  logger.log('🐵  Tell us about your project \n');

  shell.config.silent = true;
  const date = Date.now();

  let paths = {};
  let tmpProject,
    ypm,
    tmpPkgJson,
    oldPkgJson,
    tmpDir;
  let repoURL = 'https://github.com/boldr/boldr-base-project.git';
  let { localPath } = args;

  const _PkgJson = {
    name: '',
    version: '1.0.0',
    description: '',
    main: '',
    author: '',
    license: '',
  };
  const nukeTmp = () => shell.rm('-rf', tmpProject);

  const gtfo = error => {
    logger.error(`Shit broke while setting up: ${repoURL}`);
    if (error) logger.log(error);
    nukeTmp();
    process.exit();
  };

  // Compare the boldr-pack's package.json boldr.version
  // configuration to make sure boldr is an expected version.
  const checkStarterboldrDxVersion = userPkgJson => {
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
  const addBoldrDxDep = (packageJson, boldrDxPrefVer) => {
    // eslint-disable-next-line max-len
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
  };

  // Adds dependencies from the boldr-packs package.json
  const updatePkgJsonDeps = packageJson => {
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
  };

  // Adds boldr and boldr-pack commands as npm scripts
  const addPackageJsonScripts = packageJson => {
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
      'lint:all',
      'stylelint',
    ];

    // for commands that aren't 1:1 name:script
    const commandMap = {
      start: 'node build/server/main.js',
      'test:watch': 'boldr-dx test -- --watch',
      'test:coverage': 'boldr-dx test -- --coverage',
      'test:browser': 'boldr-dx test',
      'test:node': 'boldr-dx test:node',
      'lint:all': 'npm run lint && npm run stylelint',
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

      // If the command is from a boldr-pack then
      // we need to copy in the boldr-pack value.
      if (tempScripts.indexOf(command) > -1) {
        packageJson.scripts[commandName] = tmpPkgJson.scripts[command];
      } else {
        packageJson.scripts[commandName] = commandMap[command] || `boldr-dx ${command}`;
      }
    });
    packageJson.scripts['boldr-dx:help'] = 'boldr-dx --help';
    logger.task('Added boldr-dx scripts into your package.json scripts');
    return packageJson;
  };

  // Add dependencies, scripts and other package to
  // the user's package.json configuration.
  const updateUserPkgJson = existingProject => {
    shell.exec('pwd');
    let userPkgJson;
    // Create a package.json definition if
    // the user doesn't already have one.
    if (shell.test('-f', path.resolve(ROOT_DIR, 'package.json'))) {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      userPkgJson = require(path.resolve(ROOT_DIR, 'package.json'));
    } else {
      userPkgJson = _PkgJson;
      logger.task('Creating a new package.json. You should fill it in.');
    }
    // Clone the package.json so that we have a backup.
    oldPkgJson = Object.assign({}, userPkgJson);

    // Add dependencies from boldr-packs
    if (!existingProject) {
      const boldrDxPrefVer = args.boldrDxVersion || checkStarterboldrDxVersion(userPkgJson);
      userPkgJson = updatePkgJsonDeps(userPkgJson);
      addBoldrDxDep(userPkgJson, boldrDxPrefVer);
    } else {
      // exisitng projects should also have boldr-dx as a devDependency
      addBoldrDxDep(userPkgJson);
    }
    // Add scripts
    userPkgJson = addPackageJsonScripts(userPkgJson);
    fs.writeFileSync(path.resolve(ROOT_DIR, 'package.json'), JSON.stringify(userPkgJson, null, 2));
  };

  // Cleans and reinstalls node modules.
  const installUserDependencies = () => {
    logger.info('Cleaning node modules and reinstalling. This may take a couple of minutes...');
    const result = shell.exec(`rm -rf ${paths.USER_NODE_MODULES} && ${ypm} install`);
    if (result.code !== 0) {
      fs.writeFileSync(path.resolve(ROOT_DIR, 'package.json'), JSON.stringify(oldPkgJson, null, 2));
      logger.error('An error occurred when trying to install node modules', result.stderr);
      logger.task('Restored the original package.json and bailing');
      logger.info('You may need to reinstall your modules');
      gtfo();
    }
    logger.task('Installed new modules');
  };

  // Create an .eslintrc in the user's base directory
  const createESLintFile = () => {
    const eslintFileName = '.eslintrc';
    const linkedPath = path.join(ROOT_DIR, eslintFileName);

    // Backup esLint if it exists
    if (shell.test('-f', linkedPath)) {
      const eslintBackup = path.join(ROOT_DIR, `${eslintFileName}-${date}.bak`);
      shell.mv(linkedPath, eslintBackup);
      logger.info(`Backed up current eslint file to: ${eslintBackup}`);
    }

    // Copy boldr eslintrc into the user's project.
    const esLintPath = path.join(__dirname, '../../config/base/.eslintrc');

    if (shell.cp(esLintPath, linkedPath).code === 0) {
      logger.task(`Created ${eslintFileName} file`);
    } else {
      logger.error(`There was a problem creating ${eslintFileName}`);
    }
  };

  // Create stylelintrc in the user's project.
  const createStylelintFile = () => {
    const stylelintFileName = '.stylelintrc';
    const userStylelintPath = path.join(ROOT_DIR, stylelintFileName);

    // Backup the user's .stylelintrc if it exists.
    if (shell.test('-f', userStylelintPath)) {
      const stylelintBackup = path.join(ROOT_DIR, `${stylelintFileName}-${date}.bak`);
      shell.mv(userStylelintPath, stylelintBackup);
      logger.info(`Backed up current stylelint file to: ${stylelintBackup}`);
    }

    // Copy boldr .stylelintrc into the user's project
    const stylelintPath = path.join(__dirname, `../../config/base/${stylelintFileName}`);
    if (shell.cp(stylelintPath, userStylelintPath).code === 0) {
      logger.task(`Created ${stylelintFileName} file`);
    } else {
      logger.error(`There was a problem creating ${stylelintFileName}`);
    }
  };

  // .editorconfig to the user's base directory.
  const createEditorconfigLink = () => {
    const editorPath = path.join(__dirname, '../../config/base/.boldr-editorconfig');
    const configPath = path.join(ROOT_DIR, '.editorconfig');

    // Backup existing editor config
    if (shell.test('-f', configPath)) {
      const mvTo = path.join(ROOT_DIR, `editorconfig-${date}.bak`);
      shell.mv(configPath, mvTo);
      logger.info(`Backed up current editor config to ${mvTo}`);
    }

    shell.cp(editorPath, configPath);
    logger.task('Created .editorconfig file');
  };

  const createBabelrc = () => {
    // back up existing .babelrc, if it exists
    if (shell.test('-f', path.resolve(ROOT_DIR, '.babelrc'))) {
      const mvTo = path.join(ROOT_DIR, `.babelrc-${date}.bak`);
      shell.mv(path.resolve(ROOT_DIR, '.babelrc'), mvTo);
      logger.info(`Backed up current .babelrc to ${mvTo}`);
    }
    shell.cp(`${tmpDir}/.babelrc`, path.resolve(ROOT_DIR, '.babelrc'));
    logger.task('Created .babelrc');
  };

  // Copy boldr.config to the user's project.
  const makeBoldrCfg = () => {
    const configFileName = 'boldr.config.js';
    const tmpConfig = path.join(tmpDir, configFileName);
    const baseConfig = path.join(__dirname, `../../config/base/${configFileName}`);
    let newConfig = tmpConfig;

    // Use the base boldr.config
    if (!shell.test('-f', tmpConfig)) {
      newConfig = baseConfig;
    }

    const copyBoldrConfig = () => {
      shell.cp(newConfig, BOLDR_CFG_DIR);
      logger.task(`Created ${configFileName} file`);
    };
    // Check if a boldr.config file already exists. If it does
    // create a copy and then replace.
    if (shell.test('-f', BOLDR_CFG_DIR)) {
      const mvTo = path.join(ROOT_DIR, `${configFileName}-${date}.bak`);
      shell.mv('-f', BOLDR_CFG_DIR, mvTo);
      logger.info(`Backed up current ${configFileName} to: ${mvTo}`);
      copyBoldrConfig();
    } else {
      copyBoldrConfig();
    }
  };

  // Create the src directory for Boldr.
  const createSrcDirectory = () => {
    const copypSrc = () => {
      const tmpSRC_DIR = path.join(tmpDir, '/src');
      shell.cp('-r', `${tmpSRC_DIR}`, ROOT_DIR);
      logger.task('Created src directory');
    };

    // Check if a src directory is already in place. If so, copy it.
    if (shell.test('-d', SRC_DIR)) {
      const mvTo = path.join(ROOT_DIR, `src-${date}-bak`);
      shell.mv('-f', SRC_DIR, mvTo);
      logger.info(`Backed up current src directory to: ${mvTo}`);
    }

    copypSrc();
  };

  // Copies gitignore file
  const createGitignore = () => {
    const gitignoreFile = path.join(ROOT_DIR, './.gitignore');
    if (!shell.test('-f', gitignoreFile)) {
      const gitignoreLocal = path.resolve(__dirname, '../../config/base/.boldr-gitignore');
      shell.cp(gitignoreLocal, gitignoreFile);
      logger.task('Created .gitignore file');
    }
  };

  const copyBoldrPackFiles = () => {
    const boldrPackFiles = (tmpPkgJson['boldr-dx'] && tmpPkgJson['boldr-dx'].files) || [];
    if (boldrPackFiles.length) {
      boldrPackFiles.forEach(file => {
        const tempFilePath = path.join(tmpDir, file);
        const filePath = path.join(ROOT_DIR, file);
        // If the file name isn't one of the boldr-dx copied files then
        // we should back up any pre-existing files in the user dir.
        if (
          [
            '.gitignore',
            '.stylelintrc',
            '.eslintrc',
            '.editorconfig',
            '.boldr/boldr.config.js',
          ].indexOf(file) === -1 &&
          (shell.test('-f', filePath) || shell.test('-d', filePath))
        ) {
          const fileBackup = path.join(ROOT_DIR, `${file}-${date}-bak`);
          shell.mv(filePath, fileBackup);
          logger.info(`Backed up current ${file} to: ${fileBackup}`);
        }
        shell.cp('-Rf', tempFilePath, ROOT_DIR);
        logger.task(`Copied ${file} from boldr-pack`);
      });
    }
  };

  // setup tasks for boldr-packs
  const boldrProjectetup = projectKind => {
    let npmName = null;
    if (projectKind) {
      tmpDir = path.join(tmpDir, boldrProject[projectKind].path);
      npmName = boldrProject[projectKind].npmName; // eslint-disable-line
    }

    const boldrprojectKind = projectKind || localPath || repoURL;
    projectKind = projectKind || 'specified';
    logger.task(`Initializing ${projectKind} Boldr project.`);

    const afterCopy = error => {
      if (error) {
        logger.error('There was a problem downloading the Boldr installation.');
        logger.log(error);
        gtfo();
      }
      // eslint-disable-next-line global-require,import/no-dynamic-require
      tmpPkgJson = require(`${tmpDir}/package.json`);
      updateUserPkgJson(false);
      installUserDependencies();
      createESLintFile();
      createBabelrc();
      createStylelintFile();
      createEditorconfigLink();
      makeBoldrCfg();
      createSrcDirectory();
      createGitignore();
      copyBoldrPackFiles();
      nukeTmp();
      logger.end(`Finished setup for: ${boldrprojectKind}  ✨`);
    };
    // Cleanup our old leftovers.
    nukeTmp();

    if (localPath) {
      shell.exec(`cp -R ${localPath} ${tmpProject}`);
      afterCopy();
    } else if (npmName) {
      shell.mkdir(tmpProject);
      shell.cd(tmpProject);
      const fakePkgPath = `${tmpProject}/package.json`;
      fs.writeFileSync(fakePkgPath, JSON.stringify(_PkgJson, null, 2));

      let installCmd = 'npm install';
      if (ypm === 'yarn') {
        installCmd = 'yarn add';
      }

      const output = shell.exec(`${installCmd} ${npmName}`);
      if (output.code !== 0) {
        throw output.stderr;
      }
      shell.cd('..');
      afterCopy();
    } else {
      simpleGit.clone(repoURL, tmpProject, {}, afterCopy);
    }
  };

  // Checks to see if user would like src backed up before continuing
  const srcPrompt = projectChoice => {
    // Check if src already exists
    if (shell.test('-d', SRC_DIR)) {
      const question = [
        {
          type: 'confirm',
          name: 'srcBackup',
          message: 'You already have a src directory. Would you like boldr-dx to backup src/ and continue?', // eslint-disable-line
          default: true,
        },
      ];
      inquire.prompt(question).then(answer => {
        if (answer.srcBackup) {
          boldrProjectetup(projectChoice);
        } else {
          process.exit();
        }
      });
    } else {
      boldrProjectetup(projectChoice);
    }
  };

  // setup tasks for setup in existing project
  const existingProjectSetup = () => {
    logger.start('Setting up Boldr');
    updateUserPkgJson(true);
    createEditorconfigLink();
    createESLintFile();
    createStylelintFile();
    makeBoldrCfg();
    createGitignore();
    logger.end('Done setting up Boldr for BoldrDX use only.');
  };

  const getRepoUrl = repositoryArg => {
    if (repositoryArg) {
      repoURL = repositoryArg;
      srcPrompt();
    } else {
      const question = [
        {
          type: 'input',
          name: 'repoUrl',
          message: 'Enter your Repo URL (https or ssh)',
          validate: answer => {
            const httpsPass = answer.match(/^https:\/\/.*.git$/);
            const sshPass = answer.match(/^git@github.com:.*.git$/);
            if (httpsPass || sshPass) {
              return true;
            }
            return 'Please enter a valid repo url';
          },
        },
      ];
      inquire.prompt(question).then(answer => {
        if (answer.repoUrl !== '') {
          repoURL = answer.repoUrl;
          srcPrompt();
        } else {
          logger.error('You did not enter a valid url. exiting...');
          process.exit(1);
        }
      });
    }
  };

  const createDir = dirName => {
    if (dirName === '') return;
    const checkAndBail = code => {
      if (code) {
        logger.error(`Unable to create directory ${dirName}. Exiting...`);
        process.exit(1);
      }
    };
    // Creates project directory if one is specified
    logger.task(`Creating your new project at ${dirName}`);
    let output = shell.mkdir(dirName);
    checkAndBail(output.code);
    output = shell.cd(dirName);
    checkAndBail(output.code);
  };
  // @TODO: Needs work
  const setupPaths = () => {
    tmpProject = path.resolve(process.cwd(), '.boldrdx-tmp'); // eslint-disable-line no-useless-escape
    tmpDir = tmpProject;
    repoURL = 'https://github.com/boldr/boldr-base-template.git';
  };

  // Runs through setup questions
  const setupPrompt = () => {
    const variationList = Object.keys(boldrProject);
    const ownRepo = "I'd like to install from a url.";
    const exist = "I don't want an existing boldr project.";
    variationList.push(ownRepo);
    variationList.push(exist);
    const ypmQ = {
      type: 'list',
      name: 'ypm',
      message: 'Which package manager should we use?',
      choices: ['yarn', 'npm'],
      default: 0,
    };
    const dirNameQ = {
      type: 'input',
      name: 'dirName',
      message: 'Enter a new directory name. To install in current directory, leave blank.',
    };

    const skQ = {
      type: 'list',
      name: 'projectChoice',
      message: 'Choose a Boldr project', // eslint-disable-line
      choices: variationList,
      default: 0,
    };
    const questions = [];

    // Check to see if yarn is installed or user has specified flag
    if (yarnOrNpm === 'yarn' && !args.packageManager) questions.push(ypmQ);
    ypm = args.packageManager ? args.packageManager : yarnOrNpm;
    if (!args.directory) questions.push(dirNameQ);
    if (!args.repository && !localPath) questions.push(skQ);

    inquire.prompt(questions).then(answer => {
      // Question 1: Package manager
      ypm = answer.ypm || ypm;
      // Question 2: Directory
      // Save Local directory Path before moving to new directory
      if (localPath) {
        localPath = path.resolve(localPath);
      }
      // Create new directory and set up path strings
      createDir(args.directory || answer.dirName);
      setupPaths();
      // question 3
      const choice = answer.projectChoice;
      if (choice === exist) {
        existingProjectSetup();
      } else {
        getRepoUrl('https://github.com/boldr/boldr-base-project.git');
      }
      // @TODO: Once out of ALPHA, allow choices :)
      // if (boldrProject.supported[choice] || choice === ownRepo || args.repository) {
      //   // add repo question then move on to src prompt
      //   getRepoUrl(args.repository);
      // } else if (boldrProject.supported[choice] || localPath) {
      //   srcPrompt(choice);
      // } else if (choice === exist) {
      //   existingProjectSetup();
      // }
    });
  };

  // Checks to see if user is running current version of boldr-cli
  // Gives option to exit if version is old
  // runs setup
  const checkCliVersionPrompt = () => {
    const currentVersion = cliPkgJson.version;
    const output = shell.exec('npm info boldr-cli version');
    const latestVersion = output.stdout.trim();
    setupPrompt();
  };

  try {
    checkCliVersionPrompt();
  } catch (err) {
    gtfo(err);
  }
};
