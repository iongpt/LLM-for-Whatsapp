/**
 * Integration tests for WhatsApp and LLM integration
 * 
 * Tests the complete flow from receiving a WhatsApp message
 * to generating and sending an LLM response.
 */

// Import mocks
const { Client: MockClient, Message: MockMessage } = require('../mocks/whatsapp');
const { OpenAI: MockOpenAI } = require('../mocks/openai');
const mockFs = require('../mocks/fs');
const electronMock = require('../mocks/electron');

// Mocks are set up in setup.js

describe('WhatsApp-LLM Integration', () => {
  let mockClient;
  let mockFileSystem;
  let openai;
  
  beforeEach(async () => {
    // Set up mock filesystem
    mockFileSystem = mockFs.setupMockFileSystem({
      settings: {
        openAiApiKey: 'test-api-key',
        openAiModel: 'gpt-3.5-turbo',
        systemPrompt: 'You are a helpful assistant.',
        maxContextLength: 10,
        customStartMessage: 'Starting AI chat',
        customStopMessage: 'Stopping AI chat',
        customResumeMessage: 'Resuming AI chat'
      }
    });
    
    // Reset module cache
    jest.resetModules();
    
    // Initialize mock WhatsApp client
    mockClient = new MockClient();
    
    // Import the module under test
    openai = require('../../app/js/openai');
    
    // Set up a custom response for testing
    const mockOpenAIInstance = openai.getOpenAIInstance();
    mockOpenAIInstance.setMockResponse('test', 'This is a test response from the LLM.');
  });
  
  afterEach(() => {
    // Clean up mock filesystem
    mockFileSystem.teardown();
  });
  
  test('should respond to WhatsApp messages using LLM', async () => {
    // Initialize the WhatsApp client
    await mockClient.initialize();
    
    // Simulate "ready" event to trigger contact loading
    mockClient.emit('ready');
    
    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create a test contact ID
    const testContactId = 'contact-1';
    
    // Simulate enabling LLM responses for this contact
    // This would normally be done through UI, but we'll simulate it directly
    // The actual implementation may vary depending on how the app stores this info
    global.llmEnabledContacts = [testContactId];
    
    // Create a spy to monitor message sending
    const sendMessageSpy = jest.spyOn(mockClient, 'sendMessage');
    
    // Simulate receiving a message from the contact
    const incomingMessage = mockClient.simulateIncomingMessage(
      testContactId, 
      'Hello, this is a test message'
    );
    
    // Wait for async processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if a response was sent
    expect(sendMessageSpy).toHaveBeenCalled();
    
    // Verify LLM API was called with the correct message
    const mockOpenAIInstance = openai.getOpenAIInstance();
    expect(mockOpenAIInstance.calls.createChatCompletion.length).toBeGreaterThan(0);
    
    // Check that the message sent to LLM contains the incoming message
    const lastLLMCall = mockOpenAIInstance.calls.createChatCompletion[
      mockOpenAIInstance.calls.createChatCompletion.length - 1
    ];
    expect(lastLLMCall.messages.some(m => 
      m.role === 'user' && m.content.includes('Hello, this is a test message')
    )).toBe(true);
    
    // Clean up
    sendMessageSpy.mockRestore();
  });
  
  test('should handle message command !start correctly', async () => {
    // Initialize the WhatsApp client
    await mockClient.initialize();
    mockClient.emit('ready');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Set up a spy on sendMessage
    const sendMessageSpy = jest.spyOn(mockClient, 'sendMessage');
    
    // Simulate receiving a !start command
    const incomingMessage = mockClient.simulateIncomingMessage(
      'contact-1', 
      '!start'
    );
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify that the custom start message was sent
    expect(sendMessageSpy).toHaveBeenCalledWith(
      'contact-1', 
      expect.stringMatching(/Starting AI chat/)
    );
    
    // Clean up
    sendMessageSpy.mockRestore();
  });
  
  test('should handle message command !stop correctly', async () => {
    // Initialize the WhatsApp client
    await mockClient.initialize();
    mockClient.emit('ready');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate a contact that already has LLM enabled
    global.llmEnabledContacts = ['contact-1'];
    
    // Set up a spy on sendMessage
    const sendMessageSpy = jest.spyOn(mockClient, 'sendMessage');
    
    // Simulate receiving a !stop command
    const incomingMessage = mockClient.simulateIncomingMessage(
      'contact-1', 
      '!stop'
    );
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify that the custom stop message was sent
    expect(sendMessageSpy).toHaveBeenCalledWith(
      'contact-1', 
      expect.stringMatching(/Stopping AI chat/)
    );
    
    // Clean up
    sendMessageSpy.mockRestore();
  });
});