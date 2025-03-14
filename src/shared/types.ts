// WhatsApp types
export interface Contact {
  id: string;
  name: string;
  number?: string;
  pushname?: string;
  isGroup: boolean;
  isBusiness?: boolean;
}

export interface ChatMessage {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  author?: string; // For group chats
  hasMedia: boolean;
  mediaUrl?: string;
  caption?: string;
  isForwarded?: boolean;
  isStarred?: boolean;
  isLLMResponse?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  timestamp: number;
  lastMessage?: ChatMessage;
  autoReplyEnabled?: boolean;
  favorite?: boolean;
  messages: ChatMessage[];
}

// LLM types
export interface LLMSettings {
  provider: 'openai' | 'local' | 'custom';
  apiKey?: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  apiEndpoint?: string;
  maxHistoryLength: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConversation {
  chatId: string;
  messages: LLMMessage[];
}

// Application state
export interface AppSettings {
  startMinimized: boolean;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  autoReplyToAll: boolean;
  debugMode: boolean;
  mediaDownloadPath: string;
  startupOnBoot: boolean;
  replyDelay: 'instant' | 'fixed' | 'random';
  fixedDelaySeconds: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
}

// IPC Channel definitions
export enum IPCChannels {
  WHATSAPP_QR = 'whatsapp:qr',
  WHATSAPP_READY = 'whatsapp:ready',
  WHATSAPP_AUTH_FAILURE = 'whatsapp:auth-failure',
  WHATSAPP_DISCONNECTED = 'whatsapp:disconnected',
  WHATSAPP_MESSAGE = 'whatsapp:message',
  WHATSAPP_MESSAGE_CREATE = 'whatsapp:message-create',
  CHAT_LIST_UPDATE = 'chats:update',
  CHAT_HISTORY = 'chat:history',
  TOGGLE_AUTO_REPLY = 'chat:toggle-auto-reply',
  SEND_MESSAGE = 'chat:send-message',
  APP_SETTINGS_GET = 'settings:get',
  APP_SETTINGS_SET = 'settings:set',
  LLM_SETTINGS_GET = 'llm:settings:get',
  LLM_SETTINGS_SET = 'llm:settings:set',
  LLM_TEST = 'llm:test'
}