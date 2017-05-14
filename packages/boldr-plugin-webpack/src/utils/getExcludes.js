module.exports = function getExcludes(settings) {
  const EXCLUDES = [
    /node_modules/,
    settings.client.bundleDir,
    settings.server.bundleDir,
  ];
  return EXCLUDES;
};
