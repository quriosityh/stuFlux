// Increase timeout for async operations
jest.setTimeout(10000);

// Suppress console logs during tests
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };
}