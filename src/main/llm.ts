import OpenAI from 'openai';
import axios from 'axios';

// Define types needed
interface LLMSettings {
  provider: 'openai' | 'local' | 'custom';
  model: string;
  temperature: number;
  systemPrompt: string;
  maxHistoryLength: number;
  apiKey?: string;
  apiEndpoint?: string;
}

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  timestamp: number;
  autoReplyEnabled: boolean;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
}

interface ChatMessage {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  author?: string;
  hasMedia: boolean;
  isForwarded: boolean;
  isStarred: boolean;
  isLLMResponse: boolean;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// State
let llmSettings: LLMSettings;
let openaiClient: OpenAI | null = null;

// Configure LLM with settings
export function configureLLM(settings: LLMSettings) {
  llmSettings = settings;
  
  // Initialize OpenAI client if using OpenAI
  if (settings.provider === 'openai' && settings.apiKey) {
    openaiClient = new OpenAI({
      apiKey: settings.apiKey
    });
  } else {
    openaiClient = null;
  }
}

// Generate LLM response for a chat
export async function generateLLMResponse(chat: Chat): Promise<string | null> {
  try {
    // Convert chat messages to LLM format
    const messages = prepareMessagesForLLM(chat);
    
    // Generate response based on provider
    switch (llmSettings.provider) {
      case 'openai':
        return await generateOpenAIResponse(messages);
      case 'local':
      case 'custom':
        return await generateCustomEndpointResponse(messages);
      default:
        throw new Error(`Unsupported LLM provider: ${llmSettings.provider}`);
    }
  } catch (error) {
    console.error('Error generating LLM response:', error);
    return "I'm having trouble connecting to my AI service right now. Please try again later.";
  }
}

// Prepare messages for LLM by converting chat messages to proper format
function prepareMessagesForLLM(chat: Chat): LLMMessage[] {
  // Start with system message
  const messages: LLMMessage[] = [
    { role: 'system', content: llmSettings.systemPrompt }
  ];
  
  // Add recent messages from chat
  const chatMessages = [...chat.messages].slice(-llmSettings.maxHistoryLength * 2);
  
  for (const message of chatMessages) {
    messages.push({
      role: message.fromMe ? 'assistant' : 'user',
      content: message.body
    });
  }
  
  return messages;
}

// Generate response using OpenAI
async function generateOpenAIResponse(messages: LLMMessage[]): Promise<string | null> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized');
  }
  
  const response = await openaiClient.chat.completions.create({
    model: llmSettings.model,
    messages: messages as any, // Type cast needed due to OpenAI types
    temperature: llmSettings.temperature,
    max_tokens: 500,
  });
  
  return response.choices[0]?.message.content || null;
}

// Generate response using custom endpoint (local or custom API)
async function generateCustomEndpointResponse(messages: LLMMessage[]): Promise<string | null> {
  if (!llmSettings.apiEndpoint) {
    throw new Error('API endpoint not configured');
  }
  
  // Prepare request in OpenAI-compatible format
  const payload = {
    model: llmSettings.model,
    messages,
    temperature: llmSettings.temperature,
    max_tokens: 500,
  };
  
  const response = await axios.post(llmSettings.apiEndpoint, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return response.data.choices?.[0]?.message?.content || null;
}

// Test the LLM configuration
export async function testLLMConfiguration(settings: LLMSettings): Promise<{ success: boolean; message: string }> {
  // Temporarily save current settings
  const originalSettings = llmSettings;
  
  try {
    // Apply test settings
    configureLLM(settings);
    
    // Test message
    const testMessages: LLMMessage[] = [
      { role: 'system', content: settings.systemPrompt },
      { role: 'user', content: 'Hello, this is a test message. Please respond with a short greeting.' }
    ];
    
    // Generate response based on provider
    let response: string | null;
    switch (settings.provider) {
      case 'openai':
        response = await generateOpenAIResponse(testMessages);
        break;
      case 'local':
      case 'custom':
        response = await generateCustomEndpointResponse(testMessages);
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${settings.provider}`);
    }
    
    if (!response) {
      throw new Error('LLM returned empty response');
    }
    
    return {
      success: true,
      message: `Test successful! Response: "${response.substring(0, 50)}${response.length > 50 ? '...' : ''}"`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error testing LLM configuration: ${error.message}`
    };
  } finally {
    // Restore original settings
    configureLLM(originalSettings);
  }
}