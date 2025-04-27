module.exports = {
  root: true,
  extends: 'next/core-web-vitals',
  // Disable typescript parser to fix the build error
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['next/babel'],
    },
  },
  rules: {
    // Disable the rule for unescaped entities since we're using Turkish characters and apostrophes
    'react/no-unescaped-entities': 'off',
    
    // You can optionally add a better rule for React Hooks dependencies
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)'
      }
    ]
  }
};
