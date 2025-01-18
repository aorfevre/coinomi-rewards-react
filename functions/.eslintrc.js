module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*",
    ".eslintrc.js",
    "jest.config.js",
  ],
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    "quotes": ["error", "single"],
    "@typescript-eslint/no-explicit-any": "off",
    "import/no-unresolved": 0,
  },
}; 