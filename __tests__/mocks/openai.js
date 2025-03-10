/**
 * Mock for OpenAI API
 * 
 * This mock simulates OpenAI API responses
 * for testing without requiring actual API calls.
 */

class MockOpenAI {
  constructor(config = {}) {
    this.apiKey = config.apiKey || 'mock-api-key';
    this.organization = config.organization;
    this.baseURL = config.baseURL;
    
    // Configurable response delay (ms)
    this.responseDelay = config.responseDelay || 300;
    
    // Configurable response content
    this.mockResponses = config.mockResponses || {
      default: 'This is a mock response from the LLM API.',
      greeting: 'Hello! How can I assist you today?',
      question: 'That\'s an interesting question. Let me think about it.'
    };
    
    // Create chat completions object with create method
    this.chat = {
      completions: {
        create: this.createChatCompletion.bind(this)
      }
    };
    
    // Track API calls for assertions
    this.calls = {
      createChatCompletion: []
    };
  }

  // Method to simulate chat completion API
  async createChatCompletion(params) {
    // Record the API call for test assertions
    this.calls.createChatCompletion.push(params);
    
    // Parse the messages to determine a context-aware response
    const lastMessage = params.messages[params.messages.length - 1];
    const content = lastMessage.content.toLowerCase();
    
    // Select response based on message content
    let responseText = this.mockResponses.default;
    
    if (content.includes('hello') || content.includes('hi ')) {
      responseText = this.mockResponses.greeting;
    } else if (content.includes('?')) {
      responseText = this.mockResponses.question;
    }
    
    // Custom response based on specific phrases
    for (const [key, value] of Object.entries(this.mockResponses)) {
      if (content.includes(key.toLowerCase()) && key !== 'default' && 
          key !== 'greeting' && key !== 'question') {
        responseText = value;
        break;
      }
    }
    
    // Calculate tokens (simplified estimation)
    const inputTokens = this.estimateTokens(params.messages);
    const outputTokens = this.estimateTokens([{ content: responseText }]);
    
    // Simulate API response delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: 'mock-chatcmpl-' + Date.now(),
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: params.model || 'gpt-3.5-turbo',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: responseText
              },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: inputTokens,
            completion_tokens: outputTokens,
            total_tokens: inputTokens + outputTokens
          }
        });
      }, this.responseDelay);
    });
  }
  
  // Simple token estimator (very rough approximation)
  estimateTokens(messages) {
    let totalChars = 0;
    
    for (const message of messages) {
      if (message.content) {
        totalChars += message.content.length;
      }
    }
    
    // Rough estimation: 4 chars per token
    return Math.ceil(totalChars / 4);
  }
  
  // Helper method to set custom response for specific phrases
  setMockResponse(phrase, response) {
    this.mockResponses[phrase] = response;
    return this;
  }
  
  // Helper to simulate API errors
  simulateError(errorType = 'rate_limit_exceeded') {
    const errors = {
      rate_limit_exceeded: {
        error: {
          message: 'Rate limit exceeded',
          type: 'rate_limit_exceeded',
          param: null,
          code: 'rate_limit_exceeded'
        }
      },
      invalid_api_key: {
        error: {
          message: 'Incorrect API key provided',
          type: 'invalid_request_error',
          param: null,
          code: 'invalid_api_key'
        }
      },
      server_error: {
        error: {
          message: 'The server had an error processing your request',
          type: 'server_error',
          param: null,
          code: 'server_error'
        }
      }
    };
    
    // Replace the create method with one that throws an error
    this.chat.completions.create = async () => {
      throw errors[errorType] || errors.server_error;
    };
    
    return this;
  }
  
  // Reset to normal behavior
  resetBehavior() {
    this.chat.completions.create = this.createChatCompletion.bind(this);
    return this;
  }
}

// Export the mock class
module.exports = {
  OpenAI: MockOpenAI
};