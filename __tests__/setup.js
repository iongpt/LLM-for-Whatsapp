/**
 * Jest setup file
 * 
 * This file runs before tests and sets up global mocks and configurations.
 */

// Mock process.nextTick to run synchronously in tests
global.process.nextTick = fn => fn();

// Mock settings 
global.mockSettings = {
  openAiApiKey: 'test-api-key',
  openAiModel: 'gpt-3.5-turbo',
  customLLMendpoint: 'http://localhost:5000',
  systemPrompt: 'You are a helpful assistant.',
  customStartMessage: 'Hello! I\'m now using AI to respond to your messages.',
  customStopMessage: 'I\'m no longer using AI to respond to your messages.',
  customResumeMessage: 'I\'m back to using AI to respond to your messages.',
  customAPIFormat: 'openai',
  maxContextLength: 10,
  theme: 'default'
};

// Set up global.llmEnabledContacts
global.llmEnabledContacts = [];

// Mocks for browser APIs that Electron might use
global.window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

// Handle name collision in package.json files
jest.mock('../app/package.json', () => ({}), { virtual: true });

// Mock node modules
jest.mock('openai', () => require('./mocks/openai'), { virtual: true });
jest.mock('whatsapp-web.js', () => require('./mocks/whatsapp'), { virtual: true });
jest.mock('electron', () => require('./mocks/electron'), { virtual: true });
jest.mock('qrcode-terminal', () => ({
  generate: jest.fn((qrCode, callback) => {
    if (callback) callback();
  })
}), { virtual: true });