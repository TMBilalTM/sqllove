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
    // Add any custom rules here
  }
};
