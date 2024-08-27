const config = {
  '**/*.(ts|tsx|js|jsx|mjs)': (filenames) => [
    `npx eslint --fix ${filenames.map((file) => `"${file}"`).join(' ')}`,
    `npx prettier --write ${filenames.map((file) => `"${file}"`).join(' ')}`,
  ],

  '**/*.(md|json)': (filenames) =>
    `npx prettier --write ${filenames.map((file) => `"${file}"`).join(' ')}`,
};

export default config;
