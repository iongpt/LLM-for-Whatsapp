/**
 * Mock for File System operations
 * 
 * This module provides utilities for mocking the fs module
 * and setting up mock file system structures for testing.
 */

const mockFs = require('mock-fs');
const path = require('path');

// Default mock settings.json content
const DEFAULT_SETTINGS = {
  openAiApiKey: 'mock-api-key',
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

/**
 * Creates a mock file system with default structure for tests
 */
function setupMockFileSystem(options = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...options.settings };
  
  const fileSystem = {
    '/mock/user/data': {
      'settings.json': JSON.stringify(settings, null, 2)
    }
  };
  
  // Add any additional files specified in options
  if (options.additionalFiles) {
    for (const [filePath, content] of Object.entries(options.additionalFiles)) {
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath);
      
      if (!fileSystem[dir]) {
        fileSystem[dir] = {};
      }
      
      fileSystem[dir][filename] = content;
    }
  }
  
  mockFs(fileSystem);
  
  return {
    teardown: () => mockFs.restore(),
    getSettings: () => settings
  };
}

/**
 * Helper to create a mock settings.json file with specific values
 */
function createMockSettings(customSettings = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...customSettings };
  return JSON.stringify(settings, null, 2);
}

module.exports = {
  setupMockFileSystem,
  createMockSettings,
  restoreMocks: mockFs.restore
};