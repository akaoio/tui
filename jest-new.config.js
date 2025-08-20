module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src-new', '<rootDir>/tests-new'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src-new/**/*.ts',
    '!src-new/**/*.d.ts',
    '!src-new/**/*.test.ts',
    '!src-new/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src-new/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests-new/setup.ts'],
  testTimeout: 10000,
};