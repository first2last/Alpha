import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Typography,
  Tooltip,
  Fade,
  Paper,
  ClickAwayListener
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  Image,
  VideoFile,
  Description,
  Mic,
  MicOff,
  Stop
} from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';

const MessageInput = ({ onSendMessage, socket, chatId, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachMenuAnchor, setAttachMenuAnchor] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Handle message send
  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && !isRecording) {
      return;
    }

    if (disabled) {
      toast.error('Cannot send message in this chat');
      return;
    }

    onSendMessage({
      content: trimmedMessage,
      messageType: 'text'
    });

    setMessage('');
    handleStopTyping();
  }, [message, onSendMessage, disabled, isRecording]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      handleTyping();
    }
  }, [handleSend]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (disabled || !socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { chatId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  }, [isTyping, socket, chatId, disabled]);

  const handleStopTyping = useCallback(() => {
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing', { chatId, isTyping: false });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [isTyping, socket, chatId]);

  // File upload handlers
  const handleAttachMenuOpen = (event) => {
    setAttachMenuAnchor(event.currentTarget);
  };

  const handleAttachMenuClose = () => {
    setAttachMenuAnchor(null);
  };

  const handleFileSelect = (accept, messageType) => {
    handleAttachMenuClose();
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.setAttribute('data-message-type', messageType);
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const messageType = event.target.getAttribute('data-message-type');
    
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      try {
        onSendMessage({
          content: message.trim(),
          messageType,
          file
        });
        setMessage('');
        handleStopTyping();
        toast.success('File uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload file');
      }
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Emoji picker handlers
  const handleEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    handleTyping();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.wav`, {
          type: 'audio/wav'
        });

        onSendMessage({
          content: '',
          messageType: 'audio',
          file: audioFile
        });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      toast.success('Recording stopped');
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      toast.success('Recording cancelled');
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      handleStopTyping();
    };
  }, [handleStopTyping]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
          <Paper
            sx={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              mb: 1,
              zIndex: 1300,
              boxShadow: 3
            }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={350}
              height={400}
            />
          </Paper>
        </ClickAwayListener>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <Fade in={isRecording}>
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'error.main',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1
            }}
          >
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  mr: 1,
                  animation: 'blink 1s infinite'
                }}
              />
              <Typography variant="body2">
                Recording... {formatRecordingTime(recordingTime)}
              </Typography>
            </Box>
            <Box>
              <IconButton size="small" onClick={stopRecording} sx={{ color: 'white', mr: 1 }}>
                <Stop />
              </IconButton>
              <IconButton size="small" onClick={cancelRecording} sx={{ color: 'white' }}>
                <MicOff />
              </IconButton>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Message Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          p: 2,
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        {/* Attach File Button */}
        <Tooltip title="Attach file">
          <IconButton
            onClick={handleAttachMenuOpen}
            disabled={disabled || isRecording}
            color="primary"
          >
            <AttachFile />
          </IconButton>
        </Tooltip>

        {/* Message Input Field */}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? "Recording audio..." : "Type a message..."}
          variant="outlined"
          size="small"
          disabled={disabled || isRecording}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Emoji">
                  <IconButton
                    onClick={toggleEmojiPicker}
                    size="small"
                    disabled={disabled || isRecording}
                  >
                    <EmojiEmotions />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />

        {/* Voice Recording Button */}
        <Tooltip title={isRecording ? "Stop recording" : "Voice message"}>
          <IconButton
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            color={isRecording ? "error" : "primary"}
          >
            {isRecording ? <Stop /> : <Mic />}
          </IconButton>
        </Tooltip>

        {/* Send Button */}
        <Tooltip title="Send message">
          <IconButton
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !isRecording) || isRecording}
            color="primary"
            size="large"
          >
            <Send />
          </IconButton>
        </Tooltip>
      </Box>

      {/* File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Attach Menu */}
      <Menu
        anchorEl={attachMenuAnchor}
        open={Boolean(attachMenuAnchor)}
        onClose={handleAttachMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleFileSelect('image/*', 'image')}>
          <Image sx={{ mr: 1 }} color="primary" />
          Photo
        </MenuItem>
        <MenuItem onClick={() => handleFileSelect('video/*', 'video')}>
          <VideoFile sx={{ mr: 1 }} color="secondary" />
          Video
        </MenuItem>
        <MenuItem onClick={() => handleFileSelect('.pdf,.doc,.docx,.txt', 'file')}>
          <Description sx={{ mr: 1 }} color="action" />
          Document
        </MenuItem>
      </Menu>

      {/* Recording Animation Styles */}
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
};

export default MessageInput;
