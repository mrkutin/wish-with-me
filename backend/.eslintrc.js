module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'standard',
    'plugin:security/recommended'
  ],
  plugins: [
    'security'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'no-console': 'warn'
  }
} 