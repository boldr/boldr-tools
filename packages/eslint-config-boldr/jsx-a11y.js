module.exports = {
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'jsx-a11y'],
  rules: {
    //
    'jsx-a11y/media-has-caption': 2,
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 2,
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 2,
    'jsx-a11y/no-noninteractive-tabindex': 2,
    // aria-label=
    'jsx-a11y/accessible-emoji': 2,
    // Enforce that anchors have content and that the content is
    // accessible to screen readers. Accessible means that it is not
    // hidden using the aria-hidden prop
    'jsx-a11y/anchor-has-content': [
      2,
      {
        components: [''],
      },
    ],
    'jsx-a11y/aria-activedescendant-has-tabindex': 2,
    'jsx-a11y/aria-props': 2,
    'jsx-a11y/aria-proptypes': 2,
    'jsx-a11y/aria-role': 2,
    'jsx-a11y/aria-unsupported-elements': 2,
    'jsx-a11y/click-events-have-key-events': 2,
    'jsx-a11y/heading-has-content': [
      2,
      {
        components: [''],
      },
    ],
    'jsx-a11y/href-no-hash': 2,
    'jsx-a11y/html-has-lang': 2,
    'jsx-a11y/iframe-has-title': 2,
    'jsx-a11y/alt-text': 2,
    'jsx-a11y/img-redundant-alt': 0,
    'jsx-a11y/label-has-for': [
      2,
      {
        components: ['label'],
      },
    ],
    'jsx-a11y/lang': 2,
    'jsx-a11y/mouse-events-have-key-events': 2,
    'jsx-a11y/no-access-key': 2,
    'jsx-a11y/no-autofocus': 0,
    'jsx-a11y/no-distracting-elements': 2,
    'jsx-a11y/no-onchange': 0,
    'jsx-a11y/no-redundant-roles': 2,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/interactive-supports-focus': 2,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/role-has-required-aria-props': 2,
    'jsx-a11y/role-supports-aria-props': 2,
    'jsx-a11y/scope': 2,
    'jsx-a11y/tabindex-no-positive': 1,
    // deprecated
    'jsx-a11y/no-marquee': 0,
  },
};
