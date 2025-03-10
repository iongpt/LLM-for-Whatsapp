module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'app/js/**/*.js',
    '!app/js/preload.js'
  ],
  testMatch: [
    '**/__tests__/**/*.js'
  ],
  moduleNameMapper: {
    '^app/(.*)$': '<rootDir>/app/$1'
  }
};