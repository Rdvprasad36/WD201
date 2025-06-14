export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest"
      },
      globals: {
        require: "readonly",
        exports: "readonly",
        module: "readonly",
        jest: "readonly"
      }
    },
    rules: {}
  }
];
