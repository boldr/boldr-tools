
const childProcess = require('child_process');

function exec(command, options) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

exports.exec = exec;
