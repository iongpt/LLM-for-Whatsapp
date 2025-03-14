import React, { useState, useEffect, useRef } from 'react';
import { Box, Alert, CssBaseline, Drawer, AppBar, Toolbar, Typography, Divider } from '@mui/material';
import QRCodeView from './components/QRCodeView';
import ChatsList from './components/ChatsList';
import ChatView from './components/ChatView';
import SettingsView from './components/SettingsView';
import { Chat, ChatMessage } from '../shared/types';

// Access to Electron API
declare global {
  interface Window {
    api: {
      whatsapp: {
        onQRCode: (callback: (qrCode: string) => void) => void;
        onReady: (callback: () => void) => void;
        onAuthFailure: (callback: (message: string) => void) => void;
        onDisconnected: (callback: (reason: string) => void) => void;
        onMessage: (callback: (data: { chatId: string, message: ChatMessage }) => void) => void;
        logout: () => Promise<{ success: boolean; message: string }>;
      };
      settings: {
        getAppSettings: () => Promise<any>;
        setAppSettings: (settings: any) => Promise<void>;
        getLLMSettings: () => Promise<any>;
        setLLMSettings: (settings: any) => Promise<void>;
        testLLM: (settings: any) => Promise<{ success: boolean; message: string }>;
      };
      chats: {
        onListUpdate: (callback: (chats: Chat[]) => void) => void;
        getHistory: (chatId: string) => Promise<{ chat: Chat, messages: ChatMessage[] } | null>;
        toggleAutoReply: (chatId: string, enabled: boolean) => void;
        sendMessage: (chatId: string, text: string) => Promise<boolean>;
        refreshChats: () => void;
      };
    };
  }
}

// App states
type AppStatus = 'loading' | 'authenticating' | 'ready' | 'error';
type ViewType = 'chats' | 'settings';

const drawerWidth = 300;

const App: React.FC = () => {
  // App state
  const [appStatus, setAppStatus] = useState<AppStatus>('loading');
  const [statusMessage, setStatusMessage] = useState<string>('Initializing WhatsApp...');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('chats');
  
  // Data state
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatMessages, setSelectedChatMessages] = useState<ChatMessage[]>([]);
  
  // References
  const chatViewRef = useRef<any>(null);
  
  useEffect(() => {
    // Set up event listeners for WhatsApp connection
    const qrUnsubscribe = window.api.whatsapp.onQRCode((qrCode: string) => {
      setAppStatus('authenticating');
      setQrCode(qrCode);
      setStatusMessage('Please scan the QR code with your phone to connect to WhatsApp');
    });
    
    const readyUnsubscribe = window.api.whatsapp.onReady(() => {
      setAppStatus('ready');
      setQrCode(null);
      setStatusMessage('Connected to WhatsApp');
    });
    
    const authFailureUnsubscribe = window.api.whatsapp.onAuthFailure((message: string) => {
      setAppStatus('error');
      setStatusMessage(`Authentication failed: ${message}`);
    });
    
    const disconnectedUnsubscribe = window.api.whatsapp.onDisconnected((reason: string) => {
      setAppStatus('error');
      setStatusMessage(`Disconnected from WhatsApp: ${reason}`);
    });
    
    // Set up chat list updates
    const chatListUnsubscribe = window.api.chats.onListUpdate((updatedChats: Chat[]) => {
      setChats(updatedChats);
    });
    
    // Message listener
    const messageUnsubscribe = window.api.whatsapp.onMessage((data: { chatId: string, message: ChatMessage }) => {
      if (data.chatId === selectedChatId) {
        // Check if this is a message we've already added to UI (to prevent duplicates)
        setSelectedChatMessages(prev => {
          // Check if there's a temporary message with the same content
          const duplicateIndex = prev.findIndex(msg => 
            msg.body === data.message.body && 
            msg.fromMe === data.message.fromMe &&
            // Allow for small timestamp differences (5 second window)
            Math.abs(msg.timestamp - data.message.timestamp) < 5000 &&
            msg.id.startsWith('temp-')
          );
          
          if (duplicateIndex >= 0) {
            // Replace the temporary message with the real one
            const newMessages = [...prev];
            newMessages[duplicateIndex] = data.message;
            return newMessages;
          } else {
            // No duplicate found, add as new message
            return [...prev, data.message];
          }
        });
        
        // If this is an LLM response, turn off the typing indicator
        if (data.message.isLLMResponse) {
          if (chatViewRef.current?.setIsTyping) {
            chatViewRef.current.setIsTyping(false);
          }
        }
      }
      
      // If we receive a message from someone else to the currently selected chat, 
      // and the auto-reply is enabled for this chat, show the typing indicator
      const chat = chats.find(c => c.id === data.chatId);
      if (data.chatId === selectedChatId && !data.message.fromMe && chat?.autoReplyEnabled) {
        if (chatViewRef.current?.setIsTyping) {
          chatViewRef.current.setIsTyping(true);
        }
      }
    });
    
    // Cleanup on unmount
    return () => {
      // Remove event listeners
      // Note: Since we don't have a proper unsubscribe mechanism, we'll just
      // let the component unmount without explicit cleanup
    };
  }, [selectedChatId]);
  
  // Load chat history when a chat is selected
  useEffect(() => {
    if (selectedChatId) {
      window.api.chats.getHistory(selectedChatId)
        .then((data) => {
          if (data) {
            setSelectedChatMessages(data.messages);
          } else {
            setSelectedChatMessages([]);
          }
        })
        .catch((error: any) => {
          console.error('Error loading chat history:', error);
          setSelectedChatMessages([]);
        });
    } else {
      setSelectedChatMessages([]);
    }
  }, [selectedChatId]);
  
  // Toggle auto-reply for a chat
  const handleToggleAutoReply = (chatId: string, enabled: boolean) => {
    window.api.chats.toggleAutoReply(chatId, enabled);
  };
  
  // Send a message
  const handleSendMessage = async (text: string) => {
    if (!selectedChatId || !text.trim()) return;
    
    try {
      // Create a temporary message object to add to UI immediately
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        body: text,
        fromMe: true,
        timestamp: Date.now(),
        hasMedia: false,
        isForwarded: false,
        isStarred: false,
        isLLMResponse: false
      };
      
      // Add to UI
      setSelectedChatMessages(prev => [...prev, tempMessage]);
      
      // Send the actual message
      const success = await window.api.chats.sendMessage(selectedChatId, text);
      if (!success) {
        console.error('Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
    }
  };
  
  // Render app content based on current state
  const renderContent = () => {
    if (appStatus === 'authenticating' && qrCode) {
      return <QRCodeView qrCode={qrCode} />;
    }
    
    if (appStatus === 'error') {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{statusMessage}</Alert>
        </Box>
      );
    }
    
    if (appStatus === 'ready') {
      if (currentView === 'chats') {
        return (
          <Box sx={{ display: 'flex', height: '100%' }}>
            <Drawer
              variant="permanent"
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { 
                  width: drawerWidth, 
                  boxSizing: 'border-box',
                  height: 'calc(100% - 64px)',
                  top: 64
                },
              }}
            >
              <ChatsList 
                chats={chats} 
                selectedChatId={selectedChatId} 
                onSelectChat={setSelectedChatId}
                onToggleAutoReply={handleToggleAutoReply}
              />
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, height: 'calc(100vh - 64px)' }}>
              {selectedChatId ? (
                <ChatView 
                  ref={chatViewRef}
                  chatId={selectedChatId}
                  messages={selectedChatMessages}
                  onSendMessage={handleSendMessage}
                  chat={chats.find(c => c.id === selectedChatId)}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="h6" color="text.secondary">
                    Select a chat to start messaging
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      } else if (currentView === 'settings') {
        return <SettingsView />;
      }
    }
    
    // Loading or other states
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">{statusMessage}</Alert>
      </Box>
    );
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            WhatsApp LLM Assistant
          </Typography>
          <Box>
            <Typography 
              variant="button" 
              sx={{ 
                mx: 2, 
                cursor: 'pointer',
                color: currentView === 'chats' ? 'primary.contrastText' : 'text.secondary',
                fontWeight: currentView === 'chats' ? 'bold' : 'normal'
              }}
              onClick={() => setCurrentView('chats')}
            >
              Chats
            </Typography>
            <Typography 
              variant="button" 
              sx={{ 
                mx: 2, 
                cursor: 'pointer',
                color: currentView === 'settings' ? 'primary.contrastText' : 'text.secondary',
                fontWeight: currentView === 'settings' ? 'bold' : 'normal'
              }}
              onClick={() => setCurrentView('settings')}
            >
              Settings
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default App;