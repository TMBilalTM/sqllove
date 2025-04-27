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
    // Disable the rule for unescaped entities to avoid issues with quotes and apostrophes
    'react/no-unescaped-entities': 'off',
    
    // Configure React Hooks dependencies properly
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)'
      }
    ]
  }
};
