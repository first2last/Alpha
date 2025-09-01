import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Badge,
  alpha,
  Chip
} from '@mui/material';
import { Circle, VolumeOff } from '@mui/icons-material';
import moment from 'moment';

const EnhancedChatList = ({ chats, selectedChat, onChatSelect, currentUser, darkMode }) => {
  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.groupName;
    const otherUser = chat.participants.find(p => p._id !== currentUser.id);
    return otherUser?.name || 'Unknown User';
  };

  const getChatAvatar = (chat) => {
    if (chat.isGroupChat) return chat.groupName?.charAt(0) || 'G';
    const otherUser = chat.participants.find(p => p._id !== currentUser.id);
    return otherUser?.avatar || otherUser?.name?.charAt(0) || '?';
  };

  const isUserOnline = (chat) => {
    if (chat.isGroupChat) return false;
    const otherUser = chat.participants.find(p => p._id !== currentUser.id);
    return otherUser?.isOnline || false;
  };

const formatTime = (date) => {
  if (!date) return '';
  
  try {
    const msgDate = new Date(date);
    const now = new Date();
    
    // If same day
    if (msgDate.toDateString() === now.toDateString()) {
      return msgDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Other dates
    return msgDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return date.toString().slice(0, 10); // Fallback
  }
};


  return (
    <Box>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography 
          variant="subtitle2" 
          fontWeight={600}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          Recent Chats ({chats.length})
        </Typography>
      </Box>

      <Box sx={{ px: 1 }}>
        {chats.map((chat) => (
          <Box
            key={chat._id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              cursor: 'pointer',
              position: 'relative',
              backgroundColor: selectedChat?._id === chat._id 
                ? alpha('#1976d2', 0.1)
                : 'transparent',
              borderLeft: selectedChat?._id === chat._id 
                ? '3px solid #1976d2'
                : '3px solid transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: selectedChat?._id === chat._id 
                  ? alpha('#1976d2', 0.15)
                  : darkMode 
                    ? alpha('#fff', 0.08)
                    : alpha('#000', 0.04),
                transform: 'translateY(-1px)',
                boxShadow: darkMode 
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => onChatSelect(chat)}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                !chat.isGroupChat && isUserOnline(chat) ? (
                  <Circle sx={{ color: '#4caf50', fontSize: 12 }} />
                ) : null
              }
            >
              <Avatar
                src={getChatAvatar(chat)}
                sx={{ 
                  width: 48, 
                  height: 48,
                  border: isUserOnline(chat) && !chat.isGroupChat
                    ? '2px solid #4caf50'
                    : '2px solid transparent',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                {getChatName(chat)?.charAt(0)}
              </Avatar>
            </Badge>

            <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={selectedChat?._id === chat._id ? 600 : 500}
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {getChatName(chat)}
                </Typography>
                {chat.isGroupChat && (
                  <Chip 
                    label="Group" 
                    size="small" 
                    sx={{ 
                      height: 16,
                      fontSize: '0.65rem',
                      color: 'primary.main',
                      backgroundColor: alpha('#1976d2', 0.1)
                    }} 
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    fontSize: '0.8rem'
                  }}
                >
                  {chat.lastMessage?.content || 'No messages yet'}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: '0.7rem' }}
                >
                  {formatTime(chat.lastMessageAt || chat.updatedAt)}
                </Typography>
              </Box>
            </Box>

            {/* Unread indicator */}
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#f44336',
                ml: 1,
                opacity: 0 // Show when there are unread messages
              }}
            />
          </Box>
        ))}

        {chats.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4, 
              color: 'text.secondary' 
            }}
          >
            <Typography variant="body2">
              No conversations yet
            </Typography>
            <Typography variant="caption">
              Start chatting with someone!
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EnhancedChatList;
