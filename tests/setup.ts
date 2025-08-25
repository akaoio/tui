// Test setup file
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environments
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock process.stdout and process.stdin for testing
export const mockStdout = {
  write: jest.fn(),
  columns: 80,
  rows: 24,
  isTTY: true,
  on: jest.fn(),
  removeListener: jest.fn(),
};

export const mockStdin = {
  setRawMode: jest.fn(),
  resume: jest.fn(),
  pause: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
  listenerCount: jest.fn().mockReturnValue(0), // For readline.emitKeypressEvents
  isTTY: true,
};

// Helper to clear all mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
};

// Helper to create a mock keyboard event
export const createKeyEvent = (name: string, ctrl = false, shift = false) => ({
  name,
  key: name,
  ctrl,
  meta: false,
  shift,
  sequence: name,
});

beforeEach(() => {
  clearAllMocks();
});