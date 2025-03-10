/**
 * Unit tests for message processing functionality
 */

const { MockMessage } = require('../mocks/whatsapp');
const { OpenAI: MockOpenAI } = require('../mocks/openai');
const mockFs = require('../mocks/fs');

// Mocks are set up in setup.js

// Import the module under test
const openai = require('../../app/js/openai');

describe('Message Processing', () => {
  let mockFileSystem;
  
  beforeEach(() => {
    // Set up mock filesystem with settings
    mockFileSystem = mockFs.setupMockFileSystem({
      settings: {
        openAiApiKey: 'test-api-key',
        openAiModel: 'gpt-3.5-turbo',
        systemPrompt: 'You are a helpful assistant.',
        maxContextLength: 5
      }
    });
    
    // Reset module state between tests
    jest.resetModules();
  });
  
  afterEach(() => {
    // Clean up mock filesystem
    mockFileSystem.teardown();
  });
  
  describe('trimMessages', () => {
    test('should trim messages to max context length', () => {
      // Create test messages
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' },
        { role: 'assistant', content: 'I am good, thank you!' },
        { role: 'user', content: 'What is the weather like?' },
        { role: 'assistant', content: 'I cannot check the weather.' }
      ];
      
      // The test
      const trimmed = openai.trimMessages(messages, 5);
      
      // Expectations
      expect(trimmed.length).toBe(5);
      expect(trimmed[0].role).toBe('system');
      expect(trimmed[1].role).toBe('user');
      expect(trimmed[1].content).toBe('How are you?');
    });
    
    test('should always keep system message even if max context is 1', () => {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
      ];
      
      const trimmed = openai.trimMessages(messages, 1);
      
      expect(trimmed.length).toBe(1);
      expect(trimmed[0].role).toBe('system');
    });
  });
  
  describe('sendMessageToLLM', () => {
    test('should call OpenAI API with correct parameters', async () => {
      // Mock message history
      const messageHistory = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
      ];
      
      // Call the function
      const response = await openai.sendMessageToLLM(messageHistory);
      
      // Get the mock OpenAI instance
      const mockOpenAIInstance = openai.getOpenAIInstance();
      
      // Check that the API was called with correct parameters
      expect(mockOpenAIInstance.calls.createChatCompletion.length).toBe(1);
      expect(mockOpenAIInstance.calls.createChatCompletion[0].messages).toEqual(messageHistory);
      expect(mockOpenAIInstance.calls.createChatCompletion[0].model).toBe('gpt-3.5-turbo');
      
      // Check the response
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
    
    test('should handle API errors gracefully', async () => {
      // Set up API to simulate an error
      const mockOpenAIInstance = openai.getOpenAIInstance();
      mockOpenAIInstance.simulateError('server_error');
      
      // Mock message history
      const messageHistory = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
      ];
      
      // The test - should return error message without throwing
      const response = await openai.sendMessageToLLM(messageHistory);
      
      // Expectations
      expect(response).toContain('Error');
      
      // Reset the mock behavior
      mockOpenAIInstance.resetBehavior();
    });
  });
  
  describe('formatMessages', () => {
    test('should convert WhatsApp messages to LLM format', () => {
      // Create mock WhatsApp messages
      const mockMessages = [
        new MockMessage({ body: 'Hello', fromMe: false }),
        new MockMessage({ body: 'Hi there!', fromMe: true }),
        new MockMessage({ body: 'How are you?', fromMe: false })
      ];
      
      // The test
      const formatted = openai.formatMessagesForLLM(mockMessages, 'You are a helpful assistant.');
      
      // Expectations
      expect(formatted.length).toBe(4); // 3 messages + 1 system prompt
      expect(formatted[0].role).toBe('system');
      expect(formatted[1].role).toBe('user');
      expect(formatted[1].content).toBe('Hello');
      expect(formatted[2].role).toBe('assistant');
      expect(formatted[2].content).toBe('Hi there!');
      expect(formatted[3].role).toBe('user');
      expect(formatted[3].content).toBe('How are you?');
    });
  });
});