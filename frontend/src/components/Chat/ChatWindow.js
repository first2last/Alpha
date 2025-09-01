import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import { 
  Done, 
  DoneAll, 
  Schedule,
  Reply
} from '@mui/icons-material';

import ReactPlayer from 'react-player';
import { 
  PlayArrow, 
  GetApp, 
  InsertDriveFile,
  Image as ImageIcon,
  VideoFile,
  AudioFile
} from '@mui/icons-material';
import MessageInput from './MessageInput';

const ChatWindow = ({ 
  chat, 
  messages, 
  currentUser, 
  onSendMessage, 
  socket, 
  darkMode 
}) => {
  const messagesEndRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getChatName = () => {
    if (chat.isGroupChat) return chat.groupName;
    const otherUser = chat.participants.find(p => p._id !== currentUser.id);
    return otherUser?.name || 'Unknown User';
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
          minute: '2-digit',
          hour12: false 
        });
      }
      
      // If yesterday
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (msgDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday ' + msgDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
      
      // Other dates
      return msgDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return date.toString().slice(0, 10);
    }
  };

 const MessageBubble = ({ message, isOwn, previousMessage, nextMessage }) => {
  const isFirstInGroup = !previousMessage || previousMessage.sender._id !== message.sender._id;
  const isLastInGroup = !nextMessage || nextMessage.sender._id !== message.sender._id;

  // Function to render message content based on type
  const renderMessageContent = () => {
    switch (message.messageType || message.type) {
      case 'image':
        return (
          <Box
            component="img"
            src={message.fileUrl || message.content}
            alt="Image"
            sx={{
              maxWidth: '100%',
              maxHeight: 300,
              borderRadius: 2,
              cursor: 'pointer'
            }}
            onClick={() => window.open(message.fileUrl || message.content, '_blank')}
          />
        );

      case 'video':
        return (
          <Box sx={{ maxWidth: 300, borderRadius: 2, overflow: 'hidden' }}>
            <ReactPlayer
              url={message.fileUrl || message.content}
              controls
              width="100%"
              height="auto"
              style={{ borderRadius: 8 }}
            />
            {message.fileName && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                📹 {message.fileName}
              </Typography>
            )}
          </Box>
        );

      case 'audio':
        return (
          <Box sx={{ minWidth: 250 }}>
            <audio controls style={{ width: '100%', marginBottom: 8 }}>
              <source src={message.fileUrl || message.content} />
              Your browser does not support audio.
            </audio>
            {message.fileName && (
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                🎵 {message.fileName}
              </Typography>
            )}
          </Box>
        );

      case 'file':
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
            onClick={() => window.open(message.fileUrl || message.content, '_blank')}
          >
            <InsertDriveFile />
            <Box>
              <Typography variant="body2">
                {message.fileName || 'File'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Click to download'}
              </Typography>
            </Box>
            <GetApp sx={{ ml: 'auto' }} />
          </Box>
        );

      default: // text message
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              wordBreak: 'break-word',
              lineHeight: 1.4
            }}
          >
            {message.content}
          </Typography>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: isLastInGroup ? 2 : 0.5,
        px: 2,
        animation: 'slideIn 0.3s ease'
      }}
    >
      {/* Avatar for received messages */}
      {!isOwn && isFirstInGroup && (
        <Avatar
          src={message.sender.avatar}
          sx={{ 
            width: 32, 
            height: 32, 
            mr: 1, 
            alignSelf: 'flex-end' 
          }}
        >
          {message.sender.name?.charAt(0)}
        </Avatar>
      )}

      {/* Spacer when no avatar */}
      {!isOwn && !isFirstInGroup && (
        <Box sx={{ width: 40 }} />
      )}

      <Paper
        elevation={1}
        sx={{
          maxWidth: message.messageType === 'text' ? '70%' : '80%', // Wider for media
          minWidth: '60px',
          px: 2,
          py: 1,
          borderRadius: 3,
          backgroundColor: isOwn 
            ? '#1976d2' 
            : darkMode ? 'grey.800' : 'white',
          color: isOwn ? 'white' : darkMode ? 'white' : 'black',
          position: 'relative',
          boxShadow: darkMode 
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Sender name for group chats and received messages */}
        {!isOwn && chat.isGroupChat && isFirstInGroup && (
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600,
              color: '#1976d2',
              display: 'block',
              mb: 0.5
            }}
          >
            {message.sender.name}
          </Typography>
        )}

        {/* Message content (text, image, video, etc.) */}
        {renderMessageContent()}

        {/* Message status and time */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: isOwn ? 'flex-end' : 'flex-start',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.7rem',
              opacity: 0.7,
              color: isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary'
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>

          {/* Message status icons for sent messages */}
          {isOwn && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
              {message.status === 'sending' && (
                <Schedule sx={{ fontSize: 12, opacity: 0.7 }} />
              )}
              {message.status === 'sent' && (
                <Done sx={{ fontSize: 12, opacity: 0.7 }} />
              )}
              {message.status === 'delivered' && (
                <DoneAll sx={{ fontSize: 12, opacity: 0.7 }} />
              )}
              {message.status === 'read' && (
                <DoneAll sx={{ fontSize: 12, color: '#4caf50' }} />
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <Paper
        elevation={1}
        sx={{
          px: 3,
          py: 2,
          backgroundColor: darkMode ? 'grey.800' : 'white',
          borderBottom: `1px solid ${darkMode ? 'grey.700' : 'grey.200'}`,
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={chat.avatar} sx={{ width: 40, height: 40 }}>
            {getChatName()?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {getChatName()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {chat.isGroupChat ? `${chat.participants.length} members` : 'Online'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 1,
          backgroundColor: darkMode 
            ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
          backgroundImage: darkMode
            ? 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'><g fill-rule=\'evenodd\'><g fill=\'%23ffffff\' fill-opacity=\'0.02\'><circle cx=\'30\' cy=\'30\' r=\'2\'/></g></g></svg>")'
            : 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'><g fill-rule=\'evenodd\'><g fill=\'%23000000\' fill-opacity=\'0.02\'><circle cx=\'30\' cy=\'30\' r=\'2\'/></g></g></svg>")'
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              p: 4
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender._id === currentUser.id;
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

              return (
                <MessageBubble
                  key={message._id || index}
                  message={message}
                  isOwn={isOwn}
                  previousMessage={previousMessage}
                  nextMessage={nextMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Typography>
        </Box>
      )}

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        socket={socket}
        chatId={chat._id}
        disabled={false}
      />

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ChatWindow;
