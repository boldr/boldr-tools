module.exports = {
  plugins: ['import'],
  env: {
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: { experimentalObjectRestSpread: true },
  },
  settings: {
    'import/ignore': ['node_modules', '.json$', '.(scss|less|css|styl)$'],
  },
  rules: {
    // https://www.npmjs.com/package/eslint-plugin-import#rules
    // static analysis
    'import/no-unresolved': 0,
    'import/named': 0,
    'import/default': 0,
    'import/namespace': 0,
    'import/no-webpack-loader-syntax': 2,

    'import/export': 2,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'import/order': [
      2,
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'ignore',
      },
    ],
    'import/no-duplicates': 2,
    'import/max-dependencies': 0,
    'import/no-absolute-path': 0,
    'import/no-dynamic-require': 0,
    'import/no-internal-modules': 0,
    'import/no-named-default': 0,
    'import/unambiguous': 0,
    'import/first': 0,
    /**
     * Report imported names marked with [at]deprecated documentation tag
     * @see https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-deprecated.md
     * @NOTE this is an in progress rule
     */
    'import/no-deprecated': 0,
    'import/imports-first': 0,
    'import/extensions': 0,
    'import/newline-after-import': 1,
    'import/no-amd': 2,
    'import/no-commonjs': 0,
    /**
     * Forbid the use of extraneous packages
     * @see https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
     * @NOTE This is broken in so many ways
     */
    'import/no-extraneous-dependencies': 0,
    /**
     * Forbid the use of mutable exports with var or let
     * @see https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-mutable-exports.md
     * @NOTE annoying for wrapped components like redux-form.
     */
    'import/no-mutable-exports': 0,

    'import/no-namespace': 0,
    'import/no-nodejs-modules': 0,
    'import/no-restricted-paths': 0,

    'import/prefer-default-export': 0,
    // only disabled until this is fixed: https://github.com/benmosher/eslint-plugin-import/issues/671
    'import/no-unassigned-import': 0,
  },
};
