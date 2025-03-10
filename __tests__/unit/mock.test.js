/**
 * Basic tests for the mock implementations
 */

const { Client: MockWhatsAppClient } = require('../mocks/whatsapp');
const { OpenAI: MockOpenAI } = require('../mocks/openai');
const electronMock = require('../mocks/electron');
const fsMock = require('../mocks/fs');

describe('Mock Implementations', () => {
  
  describe('WhatsApp Mock', () => {
    let client;
    
    beforeEach(() => {
      client = new MockWhatsAppClient();
    });
    
    test('should initialize and emit ready event', async () => {
      const readyCallback = jest.fn();
      client.on('ready', readyCallback);
      
      await client.initialize();
      
      // Fast-forward to trigger auth and ready events
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      expect(readyCallback).toHaveBeenCalled();
      expect(client.authenticated).toBe(true);
    });
    
    test('should get contacts', async () => {
      const contacts = await client.getContacts();
      
      expect(Array.isArray(contacts)).toBe(true);
      expect(contacts.length).toBeGreaterThan(0);
      expect(contacts[0].name).toBeDefined();
    });
    
    test('should simulate sending and receiving messages', async () => {
      const messageCallback = jest.fn();
      client.on('message', messageCallback);
      
      // Simulate incoming message
      const incomingMessage = client.simulateIncomingMessage('contact-1', 'Hello, test!');
      
      expect(messageCallback).toHaveBeenCalledWith(incomingMessage);
      expect(incomingMessage.body).toBe('Hello, test!');
      expect(incomingMessage.fromMe).toBe(false);
    });
  });
  
  describe('OpenAI Mock', () => {
    let openai;
    
    beforeEach(() => {
      openai = new MockOpenAI({
        apiKey: 'test-api-key',
        mockResponses: {
          test: 'This is a test response'
        }
      });
    });
    
    test('should generate responses based on input', async () => {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'This is a test message' }
        ]
      });
      
      expect(completion.choices[0].message.content).toBeDefined();
      expect(completion.model).toBe('gpt-3.5-turbo');
    });
    
    test('should return custom responses for specific phrases', async () => {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'test' }
        ]
      });
      
      expect(completion.choices[0].message.content).toBe('This is a test response');
    });
    
    test('should simulate API errors', async () => {
      openai.simulateError('server_error');
      
      await expect(openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }]
      })).rejects.toMatchObject({
        error: {
          message: 'The server had an error processing your request',
          type: 'server_error'
        }
      });
    });
  });
  
  describe('Electron Mock', () => {
    test('should send and receive IPC messages', () => {
      const testChannel = 'test-channel';
      const testData = { test: 'data' };
      
      // Setup IPC handler
      const handlerSpy = jest.fn();
      electronMock.ipcMain.on(testChannel, (event, data) => {
        handlerSpy(data);
      });
      
      // Send message
      electronMock.ipcRenderer.send(testChannel, testData);
      
      // Check that the handler was called with the right data
      expect(handlerSpy).toHaveBeenCalledWith(testData);
    });
  });
  
  describe('Filesystem Mock', () => {
    let mockFs;
    
    afterEach(() => {
      if (mockFs && mockFs.teardown) {
        mockFs.teardown();
      }
    });
    
    test('should set up mock file system with settings', () => {
      mockFs = fsMock.setupMockFileSystem({
        settings: {
          testSetting: 'test-value'
        }
      });
      
      const settings = mockFs.getSettings();
      expect(settings.testSetting).toBe('test-value');
    });
  });
});