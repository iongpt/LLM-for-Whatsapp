import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  IconButton, 
  Divider, 
  Avatar,
  Tooltip,
  Badge,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Chat, ChatMessage } from '../../shared/types';

interface ChatViewProps {
  chatId: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  chat?: Chat;
}

interface ChatViewState {
  isTyping: boolean;
}

const ChatView = React.forwardRef<ChatViewState, ChatViewProps>(({ 
  chatId, 
  messages, 
  onSendMessage,
  chat 
}, ref) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Expose isTyping state to parent components
  React.useImperativeHandle(ref, () => ({
    isTyping,
    setIsTyping
  }));
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Handle message submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };
  
  // Group messages by date for better UI organization
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    let currentGroup: ChatMessage[] = [];
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      
      if (date !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: [...currentGroup] });
          currentGroup = [];
        }
        currentDate = date;
      }
      
      currentGroup.push(message);
    });
    
    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }
    
    return groups;
  };
  
  // Format date divider
  const formatDateDivider = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Group consecutive messages from the same sender
  const renderMessages = (messagesToRender: ChatMessage[]) => {
    const result: JSX.Element[] = [];
    let currentSender: string | null = null;
    let messageGroup: ChatMessage[] = [];
    
    messagesToRender.forEach((message, index) => {
      const sender = message.fromMe ? 'me' : 'them';
      
      if (sender !== currentSender) {
        if (messageGroup.length > 0) {
          result.push(renderMessageGroup(messageGroup, currentSender === 'me'));
          messageGroup = [];
        }
        currentSender = sender;
      }
      
      messageGroup.push(message);
      
      // If last message or different sender next, push the group
      if (index === messagesToRender.length - 1) {
        result.push(renderMessageGroup(messageGroup, currentSender === 'me'));
      }
    });
    
    return result;
  };
  
  // Render a group of consecutive messages from the same sender
  const renderMessageGroup = (messages: ChatMessage[], isFromMe: boolean) => {
    return (
      <Box 
        key={messages[0].id}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: isFromMe ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        {messages.map((message, index) => (
          <Box key={message.id} sx={{ display: 'flex', maxWidth: '70%', mb: index === messages.length - 1 ? 0 : 1 }}>
            {index === 0 && !isFromMe && (
              <Avatar sx={{ width: 32, height: 32, mr: 1, mt: 1 }}>
                {message.author?.charAt(0) || '?'}
              </Avatar>
            )}
            
            <Paper 
              sx={{ 
                p: 1.5, 
                bgcolor: isFromMe 
                  ? (message.isLLMResponse ? 'success.dark' : 'primary.main') 
                  : 'background.paper',
                borderRadius: 2,
                position: 'relative'
              }}
              elevation={1}
            >
              {message.isLLMResponse && (
                <Tooltip title="AI-generated response">
                  <SmartToyIcon 
                    sx={{ 
                      position: 'absolute', 
                      top: -10, 
                      right: -10, 
                      fontSize: 16, 
                      color: 'success.main', 
                      bgcolor: 'background.paper', 
                      borderRadius: '50%',
                      p: 0.2
                    }} 
                  />
                </Tooltip>
              )}
              
              <Typography variant="body1">
                {message.body}
              </Typography>
              
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
              >
                {formatTime(message.timestamp)}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>
    );
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2 }}>
            {chat?.name.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{chat?.name || 'Chat'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {chat?.isGroup ? 'Group' : 'Contact'}
              {chat?.autoReplyEnabled && ' • Auto-reply enabled'}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Messages area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          mb: 2, 
          pr: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messageGroups.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send a message to start the conversation
            </Typography>
          </Box>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <Box key={group.date}>
              {/* Date divider */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  my: 2,
                  position: 'relative'
                }}
              >
                <Divider sx={{ position: 'absolute', width: '100%', top: '50%' }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: 'background.default', 
                    px: 2, 
                    py: 0.5,
                    borderRadius: 1,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {formatDateDivider(group.date)}
                </Typography>
              </Box>
              
              {/* Messages for this date */}
              {renderMessages(group.messages)}
              
              {/* Add some space between dates */}
              {groupIndex < messageGroups.length - 1 && <Box sx={{ height: 16 }} />}
            </Box>
          ))
        )}
        {/* Typing indicator */}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1, mt: 1 }}>
              {chat?.name.charAt(0) || '?'}
            </Avatar>
            <Paper 
              sx={{ 
                p: 1.5, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center'
              }}
              elevation={1}
            >
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography 
                variant="body2" 
                sx={{ fontStyle: 'italic', color: 'text.secondary' }}
              >
                Typing...
              </Typography>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Message input */}
      <Paper 
        component="form" 
        elevation={3} 
        sx={{ p: 1, display: 'flex', alignItems: 'center' }}
        onSubmit={handleSubmit}
      >
        <TextField
          fullWidth
          placeholder="Type a message"
          variant="outlined"
          size="small"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          autoFocus
        />
        <IconButton 
          color="primary" 
          sx={{ ml: 1 }} 
          type="submit"
          disabled={!messageText.trim()}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
});

export default ChatView;