import { jest } from '@jest/globals';

jest.setTimeout(30000);

// Suppress console logs during tests
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  } as Console;
}