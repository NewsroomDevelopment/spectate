const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

async function create() {
  console.log();
  console.log(
    `Creating a new Spectate project in ${chalk.bold.green(process.cwd())}.`,
  );
  console.log();

  // Copy template into current directory
  await fs.copy(path.join(__dirname, '../templates/default'), './');
  // TODO: --is-embed (see config-project.js)

  // Use npm to install node packages
  console.log('Installing packages. This might take a minute.');
  console.log(chalk.bold('npm install'));
  execSync('npm install', { stdio: 'inherit' });

  // Initialize git repository
  if (!isInGitRepository()) {
    execSync('git init', { stdio: 'ignore' });
    console.log('Initialized a git repository.');
    console.log();
  }

  // Run download-doc to generate default PostHTML config
  await require('./download-doc')();
  console.log();

  // Stage everything and create the first commit
  if (tryGitCommit()) {
    console.log('Created git commit.');
    console.log();
  }

  // Documentation messages and next steps
  console.log('Success! Inside this repository you can run several commands:');
  logCommand('npm start', 'Starts the development server.');
  logCommand(
    'spectate download',
    'Downloads the Google Doc and updates configuration files.',
  );
  logCommand('spectate init', 'Configures remotes for GitHub and Google Docs.');

  console.log();
  console.log('Please check the Spectate README for further instructions.');
}

function logCommand(displayedCommand, documentation) {
  console.log();
  console.log('  ' + chalk.cyan(displayedCommand));
  console.log('    ' + documentation);
}

/* Returns whether we're in a git repo */
function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/* Tries to create an initial git commit */
function tryGitCommit() {
  try {
    execSync('git add -A', { stdio: 'ignore' });
    execSync('git commit -m "Create project with Spectate"', {
      stdio: 'ignore',
    });
    return true;
  } catch (e) {
    return false;
  }
}

create().catch(console.error);