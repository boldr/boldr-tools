module.exports = function getExcludes(settings) {
  const EXCLUDES = [
    /node_modules/,
    settings.bundle.client.bundleDir,
    settings.bundle.server.bundleDir,
  ];
  return EXCLUDES;
};
