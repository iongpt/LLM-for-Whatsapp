import { BrowserWindow, ipcMain } from 'electron';
import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import Store from 'electron-store';
import { generateLLMResponse } from './llm';

// Define channel constants directly here
const IPCChannels = {
  WHATSAPP_QR: 'whatsapp-qr',
  WHATSAPP_READY: 'whatsapp-ready',
  WHATSAPP_AUTH_FAILURE: 'whatsapp-auth-failure',
  WHATSAPP_DISCONNECTED: 'whatsapp-disconnected',
  WHATSAPP_MESSAGE: 'whatsapp-message',
  CHAT_LIST_UPDATE: 'chat-list-update',
  CHAT_HISTORY: 'chat-history',
  TOGGLE_AUTO_REPLY: 'toggle-auto-reply',
  SEND_MESSAGE: 'send-message',
  APP_SETTINGS_GET: 'app-settings-get',
  APP_SETTINGS_SET: 'app-settings-set',
  LLM_SETTINGS_GET: 'llm-settings-get',
  LLM_SETTINGS_SET: 'llm-settings-set',
  LLM_TEST: 'llm-test',
  WHATSAPP_LOGOUT: 'whatsapp-logout'
};

// Define interfaces needed in this file
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

// Add global types for typechecking
declare global {
  namespace NodeJS {
    interface Global {
      isAutoReplying: boolean;
      autoReplyingChatId: string | null;
    }
  }
}

// Initialize global variables for tracking auto-replies
global.isAutoReplying = false;
global.autoReplyingChatId = null;

// State
let whatsappClient: Client | null = null;
let mainWindow: BrowserWindow | null = null;
const chats = new Map<string, Chat>();
const autoReplyChatIds = new Set<string>();
const conversationStore = new Store({ name: 'conversations' });
const settingsStore = new Store({ name: 'settings' });

// Initialize WhatsApp client
export function initWhatsApp(window: BrowserWindow) {
  mainWindow = window;
  
  // Initialize WhatsApp client with puppeteer options for better compatibility
  // Import puppeteer explicitly
  const puppeteer = require('puppeteer');
  
  whatsappClient = new Client({
    authStrategy: new LocalAuth({ 
      dataPath: path.join(process.cwd(), '.wwebjs_auth'),
      clientId: 'whatsapp-llm-assistant' 
    }),
    puppeteer: {
      headless: true, // Hide WhatsApp window - we'll show QR code in our UI
      executablePath: puppeteer.executablePath(), // Use installed Puppeteer
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
      ],
      defaultViewport: {
        width: 1280,
        height: 900
      },
      ignoreHTTPSErrors: true
    }
  });

  // Set up event handlers
  setupEventHandlers();
  
  // Initialize the client with error handling
  try {
    console.log('Initializing WhatsApp client...');
    whatsappClient.initialize().catch(err => {
      console.error('Failed to initialize WhatsApp client:', err);
      mainWindow?.webContents.send(IPCChannels.WHATSAPP_AUTH_FAILURE, err.message);
    });
  } catch (error) {
    console.error('Error in WhatsApp initialization:', error);
    mainWindow?.webContents.send(IPCChannels.WHATSAPP_AUTH_FAILURE, 'Failed to start WhatsApp client');
  }
}

// Set up event handlers for WhatsApp client
function setupEventHandlers() {
  if (!whatsappClient) return;

  // QR code event
  whatsappClient.on('qr', (qrCode) => {
    console.log('QR code received, length:', qrCode.length);
    // Generate QR code image with better options for clarity
    const qrcode = require('qrcode');
    qrcode.toDataURL(qrCode, {
      errorCorrectionLevel: 'H', // High error correction for better scanning
      margin: 2,
      scale: 8, // Larger scale for better visibility
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, (err, url) => {
      if (err) {
        console.error('Failed to generate QR code image:', err);
        return;
      }
      
      console.log('QR code image generated, sending to renderer');
      mainWindow?.webContents.send(IPCChannels.WHATSAPP_QR, url);
    });
  });

  // Authentication failure
  whatsappClient.on('auth_failure', (message) => {
    console.error('Authentication failed:', message);
    mainWindow?.webContents.send(IPCChannels.WHATSAPP_AUTH_FAILURE, message);
  });

  // Client ready
  whatsappClient.on('ready', async () => {
    console.log('WhatsApp client is ready');
    mainWindow?.webContents.send(IPCChannels.WHATSAPP_READY);
    
    // Load all chats
    await loadChats();
  });

  // Disconnected
  whatsappClient.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
    mainWindow?.webContents.send(IPCChannels.WHATSAPP_DISCONNECTED, reason);
  });

  // New message
  whatsappClient.on('message', async (message) => {
    console.log('New message received:', message.body);
    await handleIncomingMessage(message);
  });

  // Message create (for outgoing messages)
  whatsappClient.on('message_create', async (message) => {
    if (message.fromMe) {
      console.log('Message sent:', message.body);
      const chatId = message.to;
      
      // Process the outgoing message
      await updateChatWithMessage(message);
      
      // Process and send the message to the UI
      const chat = chats.get(chatId);
      if (chat && chat.messages.length > 0) {
        // Get the most recent message (the one we just added)
        const lastMessage = chat.messages[chat.messages.length - 1];
        
        // Check if this is an LLM response
        if (global.isAutoReplying && global.autoReplyingChatId === chatId) {
          console.log('Marking message as LLM response:', lastMessage.body);
          lastMessage.isLLMResponse = true;
          saveConversation(chatId, chat.messages);
          
          // Reset auto-reply flags
          global.isAutoReplying = false;
          global.autoReplyingChatId = null;
        }
        
        // Send to UI with updated LLM flag
        mainWindow?.webContents.send(IPCChannels.WHATSAPP_MESSAGE, {
          chatId: chatId,
          message: lastMessage
        });
      }
    }
  });

  // Set up IPC handlers
  setupIPCHandlers();
}

// Load all chats
async function loadChats() {
  if (!whatsappClient) return;

  try {
    const wwebChats = await whatsappClient.getChats();
    for (const chat of wwebChats) {
      const contact = await chat.getContact();
      const savedMessages = conversationStore.get(`chat:${chat.id._serialized}`, []) as ChatMessage[];
      
      // Create chat object
      const chatObj: Chat = {
        id: chat.id._serialized,
        name: chat.name || contact.name || contact.pushname || 'Unknown',
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        timestamp: chat.timestamp || Date.now(),
        autoReplyEnabled: autoReplyChatIds.has(chat.id._serialized),
        messages: savedMessages || [],
      };

      // Get last message if available
      if (chat.lastMessage) {
        chatObj.lastMessage = convertMessage(chat.lastMessage);
      }

      chats.set(chat.id._serialized, chatObj);
    }

    // Send chat list to renderer
    sendChatListUpdate();
  } catch (error) {
    console.error('Error loading chats:', error);
  }
}

// Convert whatsapp-web.js Message to our ChatMessage format
function convertMessage(message: Message): ChatMessage {
  return {
    id: message.id._serialized,
    body: message.body,
    fromMe: message.fromMe,
    timestamp: message.timestamp || Date.now(),
    author: message.author || undefined,
    hasMedia: message.hasMedia,
    isForwarded: message.isForwarded,
    isStarred: message.isStarred,
    isLLMResponse: false,
  };
}

// Handle incoming message
async function handleIncomingMessage(message: Message) {
  try {
    // Ignore status messages
    if (message.isStatus) return;
    
    // Convert to our message format
    const chatMessage = convertMessage(message);
    
    // Update chat with the message
    await updateChatWithMessage(message);
    
    // Send message to renderer immediately
    mainWindow?.webContents.send(IPCChannels.WHATSAPP_MESSAGE, {
      chatId: message.from,
      message: chatMessage
    });
    console.log('Sent message to UI:', chatMessage.body);
    
    // Check if we should auto-reply
    const shouldAutoReply = 
      (autoReplyChatIds.has(message.from) || settingsStore.store.autoReplyToAll) && 
      !message.fromMe;
    
    if (shouldAutoReply) {
      await generateAndSendAutoReply(message);
    }
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

// Update chat with a message
async function updateChatWithMessage(message: Message) {
  // Get chat ID
  const chatId = message.fromMe ? message.to : message.from;
  
  // Get or create chat
  let chat = chats.get(chatId);
  if (!chat) {
    // This is a new chat, get chat and contact info
    const wwebChat = await message.getChat();
    const contact = await wwebChat.getContact();
    
    chat = {
      id: chatId,
      name: wwebChat.name || contact.name || contact.pushname || 'Unknown',
      isGroup: wwebChat.isGroup,
      unreadCount: wwebChat.unreadCount,
      timestamp: message.timestamp || Date.now(),
      autoReplyEnabled: autoReplyChatIds.has(chatId),
      messages: [],
    };
    
    chats.set(chatId, chat);
  }
  
  // Update chat timestamp
  chat.timestamp = message.timestamp || Date.now();
  
  // If not from me, increment unread count
  if (!message.fromMe) {
    chat.unreadCount = (chat.unreadCount || 0) + 1;
  }
  
  // Add message to chat
  const chatMessage = convertMessage(message);
  chat.messages.push(chatMessage);
  chat.lastMessage = chatMessage;
  
  // Save conversation
  saveConversation(chatId, chat.messages);
  
  // Send updated chat list to renderer
  sendChatListUpdate();
}

// Generate and send auto-reply
async function generateAndSendAutoReply(message: Message) {
  try {
    const chatId = message.from;
    const chat = chats.get(chatId);
    
    if (!chat) return;
    
    console.log(`Generating auto-reply for chat ${chatId}`);
    
    // Set flag that we're currently auto-replying
    global.isAutoReplying = true;
    global.autoReplyingChatId = chatId;
    
    // Generate response using LLM
    const response = await generateLLMResponse(chat);
    
    if (!response) {
      // Reset flag if we failed to generate a response
      global.isAutoReplying = false;
      global.autoReplyingChatId = null;
      return;
    }
    
    console.log(`LLM generated response: ${response}`);
    
    // Send response - the message_create event will handle marking as LLM response
    await sendMessage(chatId, response);
    
    // Note: We don't need to manually mark the message anymore as that's handled in the message_create handler
    // The message_create event will reset the auto-reply flags after processing
  } catch (error) {
    console.error('Error generating auto-reply:', error);
    // Reset flags on error
    global.isAutoReplying = false;
    global.autoReplyingChatId = null;
  }
}

// Send chat list update to renderer
function sendChatListUpdate() {
  // Convert chats map to array and sort by timestamp (newest first)
  const chatList = Array.from(chats.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  
  // Send to renderer
  mainWindow?.webContents.send(IPCChannels.CHAT_LIST_UPDATE, chatList);
}

// Save conversation to store
function saveConversation(chatId: string, messages: ChatMessage[]) {
  // Limit to last 100 messages to prevent store from growing too large
  const messagesToSave = messages.slice(-100);
  conversationStore.set(`chat:${chatId}`, messagesToSave);
}

// Logout from WhatsApp
async function logoutWhatsApp(): Promise<{ success: boolean; message: string }> {
  if (!whatsappClient) {
    return { success: false, message: 'WhatsApp client not initialized' };
  }

  try {
    console.log('Attempting to logout from WhatsApp...');
    
    // Clear all data from our app
    chats.clear();
    autoReplyChatIds.clear();
    global.isAutoReplying = false;
    global.autoReplyingChatId = null;
    
    // Properly destroy the client
    await whatsappClient.destroy();
    
    // Explicitly set client to null
    whatsappClient = null;
    
    // Clean up the auth directory
    const authPath = path.join(process.cwd(), '.wwebjs_auth', 'session-whatsapp-llm-assistant');
    
    try {
      // Use fs-extra's remove instead of rmdir 
      // This handles non-empty directories recursively
      await fsExtra.remove(authPath);
      console.log('Successfully removed auth directory');
    } catch (err) {
      console.error('Error removing auth directory:', err);
      // Don't fail the logout just because we couldn't remove the directory
    }
    
    console.log('WhatsApp logout completed successfully');
    return { success: true, message: 'Logged out successfully' };
  } catch (error: any) {
    console.error('Error during WhatsApp logout:', error);
    return { 
      success: false, 
      message: `Logout failed: ${error?.message || 'Unknown error'}`
    };
  }
}

// Set up IPC handlers for communication with renderer
function setupIPCHandlers() {
  // Toggle auto-reply for a chat
  ipcMain.on(IPCChannels.TOGGLE_AUTO_REPLY, (_, chatId: string, enabled: boolean) => {
    if (enabled) {
      autoReplyChatIds.add(chatId);
    } else {
      autoReplyChatIds.delete(chatId);
    }
    
    // Update chat
    const chat = chats.get(chatId);
    if (chat) {
      chat.autoReplyEnabled = enabled;
      sendChatListUpdate();
    }
  });
  
  // Send message
  ipcMain.handle(IPCChannels.SEND_MESSAGE, async (_, chatId: string, text: string) => {
    return sendMessage(chatId, text);
  });
  
  // Get chat history
  ipcMain.handle(IPCChannels.CHAT_HISTORY, async (_, chatId: string) => {
    const chat = chats.get(chatId);
    
    if (chat) {
      // Mark chat as read
      chat.unreadCount = 0;
      sendChatListUpdate();
      
      return {
        chat,
        messages: chat.messages
      };
    }
    
    // Even if we don't find the chat, send the current chat list
    // This helps refresh the UI when returning from settings tab
    sendChatListUpdate();
    
    return null;
  });
  
  // Listen for 'refresh-chats' request from renderer to force update
  ipcMain.on('refresh-chats', () => {
    console.log('Received request to refresh chats');
    sendChatListUpdate();
  });
  
  // Handle logout request
  ipcMain.handle(IPCChannels.WHATSAPP_LOGOUT, async () => {
    return logoutWhatsApp();
  });
}

// Send a message
export async function sendMessage(chatId: string, text: string): Promise<boolean> {
  if (!whatsappClient) return false;
  
  try {
    await whatsappClient.sendMessage(chatId, text);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}