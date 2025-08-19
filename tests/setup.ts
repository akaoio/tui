// Global test setup
import { initLip } from '../src/lipgloss';

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Add global performance if not available
if (typeof global.performance === 'undefined') {
  global.performance = require('perf_hooks').performance;
}

beforeAll(async () => {
  // Initialize WASM once for all tests
  try {
    console.log('Initializing WASM for tests...');
    const isInit = await initLip();
    if (!isInit) {
      throw new Error('Failed to initialize WASM');
    }
    console.log('WASM initialized successfully');
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

// Suppress console output during tests unless DEBUG is set
if (!process.env.DEBUG) {
  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
}

// Increase timeout for WASM operations
jest.setTimeout(30000);