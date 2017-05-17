const fs = require('fs');

/**
 * Checks whether or not a file exissts
 * @param  {String} filePath path to the file
 * @return {String}          returns the filePath or an empty string
 */
function ifIsFile(filePath) {
  try {
    return fs.statSync(filePath).isFile() ? filePath : '';
  } catch (ex) {
    /* console.log(ex)*/
  }
  return '';
}

module.exports = ifIsFile;
