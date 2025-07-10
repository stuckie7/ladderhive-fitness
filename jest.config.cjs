const { defaults: tsjPreset } = require('ts-jest/presets');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    ...tsjPreset.transform,
    '^.+\.[jt]sx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|vfile|vfile-message|unist-util-stringify-position|unified|bail|is-plain-obj|trough|remark-parse|mdast-util-from-markdown|mdast-util-to-string|mdast-util-to-markdown|micromark-util-combine-extensions|micromark-util-chunked|micromark-util-types|micromark-util-symbol|micromark-util-resolve-all|micromark-util-encode|micromark-util-sanitize-uri|micromark-util-subtokenize|micromark-util-decode-numeric-character-reference|micromark-util-decode-string|micromark-util-normalize-identifier|micromark-util-html-tag-name)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
};
