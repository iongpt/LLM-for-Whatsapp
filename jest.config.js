module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'app/js/**/*.js',
    '!app/js/preload.js'
  ],
  testMatch: [
    '**/__tests__/unit/mock.test.js'
  ],
  moduleNameMapper: {
    '^app/(.*)$': '<rootDir>/app/$1'
  },
  modulePathIgnorePatterns: [
    "node_modules"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(whatsapp-web\\.js)/)"
  ],
  setupFiles: [
    '<rootDir>/__tests__/setup.js'
  ]
};