/**
 * Mock for whatsapp-web.js Client
 * 
 * This mock simulates the behavior of the WhatsApp Web client
 * for testing without requiring actual WhatsApp authentication.
 */

const EventEmitter = require('events');

class MockContact {
  constructor(data = {}) {
    this.id = { 
      _serialized: data.id || 'mock-contact-id' 
    };
    this.name = data.name || 'Mock Contact';
    this.number = data.number || '1234567890';
    this.isGroup = data.isGroup || false;
    this.isBusiness = data.isBusiness || false;
  }

  async getProfilePicUrl() {
    return 'https://mock-profile-pic.url';
  }
}

class MockMessage {
  constructor(data = {}) {
    this.id = { 
      _serialized: data.id || 'mock-message-id' 
    };
    this.body = data.body || 'Mock message content';
    this.from = data.from || 'mock-contact-id';
    this.to = data.to || 'me';
    this.fromMe = data.fromMe || false;
    this.timestamp = data.timestamp || Date.now();
    this._data = {
      notifyName: data.notifyName || 'Mock Contact'
    };
  }

  getContact() {
    return Promise.resolve(new MockContact({ id: this.from }));
  }
}

class MockChat {
  constructor(data = {}) {
    this.id = { 
      _serialized: data.id || 'mock-chat-id' 
    };
    this.name = data.name || 'Mock Chat';
    this.isGroup = data.isGroup || false;
  }

  async fetchMessages(options = {}) {
    const count = options.limit || 10;
    const messages = [];
    
    for (let i = 0; i < count; i++) {
      messages.push(new MockMessage({
        id: `mock-message-${i}`,
        body: `Mock message ${i}`,
        timestamp: Date.now() - (i * 60000) // 1 minute apart
      }));
    }
    
    return messages;
  }
}

class MockClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.initialized = false;
    this.authenticated = false;
    
    // Create a set of mock contacts
    this.mockContacts = [
      new MockContact({ id: 'contact-1', name: 'John Doe', number: '1234567890' }),
      new MockContact({ id: 'contact-2', name: 'Jane Smith', number: '0987654321' }),
      new MockContact({ id: 'group-1', name: 'Family Group', isGroup: true }),
    ];
    
    // Create mock chats
    this.mockChats = [
      new MockChat({ id: 'chat-1', name: 'John Doe' }),
      new MockChat({ id: 'chat-2', name: 'Jane Smith' }),
      new MockChat({ id: 'chat-3', name: 'Family Group', isGroup: true })
    ];
  }

  initialize() {
    this.initialized = true;
    
    // Simulate authentication flow with QR code
    process.nextTick(() => {
      this.emit('qr', 'mock-qr-code-data');
      
      // Simulate successful authentication after 1 second
      setTimeout(() => {
        this.authenticated = true;
        this.emit('authenticated');
        
        // Emit ready event after authentication
        setTimeout(() => {
          this.emit('ready');
        }, 500);
      }, 1000);
    });
    
    return Promise.resolve();
  }

  async getContacts() {
    return this.mockContacts;
  }

  async getChats() {
    return this.mockChats;
  }

  async getContactById(id) {
    const contact = this.mockContacts.find(c => c.id._serialized === id);
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async getChatById(id) {
    const chat = this.mockChats.find(c => c.id._serialized === id);
    if (!chat) {
      throw new Error(`Chat with ID ${id} not found`);
    }
    return chat;
  }

  async sendMessage(to, content) {
    // Create a new mock message
    const message = new MockMessage({
      from: 'me',
      to: to,
      body: content,
      fromMe: true,
      timestamp: Date.now()
    });
    
    // Emit message event after a small delay to simulate network
    setTimeout(() => {
      this.emit('message_create', message);
    }, 100);
    
    return message;
  }

  // Utility method to simulate incoming messages (for tests)
  simulateIncomingMessage(contactId, content) {
    const message = new MockMessage({
      from: contactId,
      body: content,
      fromMe: false,
      timestamp: Date.now()
    });
    
    this.emit('message', message);
    return message;
  }

  // Utility to simulate disconnection
  simulateDisconnect(reason = 'unknown') {
    this.emit('disconnected', reason);
    this.authenticated = false;
    this.initialized = false;
  }
}

module.exports = {
  Client: MockClient,
  Contact: MockContact,
  Message: MockMessage,
  Chat: MockChat
};