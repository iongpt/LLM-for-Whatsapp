import React, { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  Box, 
  IconButton, 
  Badge, 
  TextField, 
  InputAdornment, 
  Switch, 
  ListItemSecondaryAction, 
  Tooltip,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Chat } from '../../shared/types';

interface ChatsListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onToggleAutoReply: (chatId: string, enabled: boolean) => void;
}

const ChatsList: React.FC<ChatsListProps> = ({ 
  chats, 
  selectedChatId, 
  onSelectChat,
  onToggleAutoReply
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter chats by search term
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format timestamp into readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format timestamp into date if not today
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return formatTime(timestamp);
    }
    
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get first letter of name for avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search chats"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Divider />
      
      <List sx={{ overflow: 'auto', flexGrow: 1 }}>
        {filteredChats.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary="No chats found" 
              secondary={searchTerm ? "Try a different search term" : "Start a new conversation"}
            />
          </ListItem>
        ) : (
          filteredChats.map(chat => (
            <ListItem 
              key={chat.id} 
              button 
              selected={selectedChatId === chat.id}
              onClick={() => onSelectChat(chat.id)}
              sx={{ 
                borderLeft: chat.autoReplyEnabled ? '3px solid #4caf50' : 'none',
                pl: chat.autoReplyEnabled ? 1.7 : 2
              }}
            >
              <ListItemAvatar>
                <Badge 
                  badgeContent={chat.unreadCount} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                >
                  <Avatar sx={{ bgcolor: chat.isGroup ? 'primary.light' : 'secondary.light' }}>
                    {chat.isGroup ? <GroupIcon /> : <PersonIcon />}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Typography 
                    noWrap 
                    variant="body1" 
                    fontWeight={chat.unreadCount > 0 ? 'bold' : 'normal'}
                  >
                    {chat.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      noWrap 
                      sx={{ flexGrow: 1, mr: 1 }}
                    >
                      {chat.lastMessage?.body || 'No messages yet'}
                    </Typography>
                    {chat.timestamp && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(chat.timestamp)}
                      </Typography>
                    )}
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <Tooltip title={chat.autoReplyEnabled ? "Auto-reply enabled" : "Auto-reply disabled"}>
                  <Switch
                    edge="end"
                    size="small"
                    checked={chat.autoReplyEnabled || false}
                    onChange={(e) => onToggleAutoReply(chat.id, e.target.checked)}
                    icon={<SmartToyIcon fontSize="small" color="disabled" />}
                    checkedIcon={<SmartToyIcon fontSize="small" color="primary" />}
                  />
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default ChatsList;