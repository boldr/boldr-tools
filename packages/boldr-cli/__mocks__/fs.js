const fs = jest.genMockFromModule('fs-extra');

let foldersThatExists = {};

fs.ensureDirSync = (path) => {
  return path;
};

fs.readFileSync = path => `Found: [${path}]`;

fs.existsSync = path => {
  return foldersThatExists[path] !== null;
};

fs.writeFileSync = (filePath, content, encoding) => {};

fs.setupMockDirectories = (directories) => {
  foldersThatExists = Object.create(null);
  for (let index = 0; index < directories.length; index++) {
    foldersThatExists[directories[index]] = true;
  }
};

module.exports = fs;
