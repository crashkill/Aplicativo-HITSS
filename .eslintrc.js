module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: [
    'dist', 
    '.eslintrc.js', 
    'node_modules',
    '*.tsx',
    '*.ts',
    'src/**/*',
    'scripts/**/*',
    'Upload_2bf3ec7.tsx'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-undef': 'off',
  },
} 