module.exports = {
  env: {
    node: true,
  },
  rules: {
    // enforce return after a callback
    'callback-return': 0,
    'global-require': 0,
    // enforces 2 handling in callbacks (node environment)
    'handle-callback-err': [2, '^.*(e|E)rr'],
    // disallow mixing regular variable and require declarations
    'no-mixed-requires': [
      2,
      {
        grouping: true,
        allowCall: false,
      },
    ],
    // disallow use of new operator with the require function
    'no-new-require': 2,
    // disallow string concatenation with __dirname and __filename
    'no-path-concat': 0,
    // disallow process.exit()
    'no-process-exit': 0,
    // restrict usage of specified node modules
    'no-restricted-modules': 0,
    // disallow use of synchronous methods (0 by default)
    'no-sync': 0,
    // disallow use of process.env
    'no-process-env': 0,
  },
};
