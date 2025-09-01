import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Switch,
  useTheme, // Added
  alpha,      // Added
} from '@mui/material';
import {
  ExitToApp,
  Settings,
  Search,
  VideoCall,
  NotificationsActive,
  LightMode,  // Added
  DarkMode,   // Added
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import UserList from '../components/User/UserList'; // Using the original components
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import { chatAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/Chat.css';

// A placeholder for the empty state component
const EmptyState = ({ darkMode }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100%"
    bgcolor={darkMode ? 'grey.800' : 'grey.50'}
  >
    <Typography variant="h5" color="text.secondary">
      Select a chat to start messaging
    </Typography>
  </Box>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const theme = useTheme(); // Hook to access theme properties
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // State for dark mode
  const [searchQuery, setSearchQuery] = useState(''); // State for search

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', ({ message, chatId }) => {
        if (selectedChat && selectedChat._id === chatId) {
          setMessages(prev => [...prev, message]);
        }
        fetchChats();
      });

      socket.on('chatUpdated', (updatedChat) => {
        setChats(prev => prev.map(chat =>
          chat._id === updatedChat._id ? updatedChat : chat
        ));
      });

      return () => {
        socket.off('newMessage');
        socket.off('chatUpdated');
      };
    }
  }, [socket, selectedChat]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [chatsRes, usersRes] = await Promise.all([
        chatAPI.getChats(),
        userAPI.getAllUsers()
      ]);
      setChats(chatsRes.data.chats);
      setUsers(usersRes.data.users.filter(u => u._id !== user._id)); // Filter out current user
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.data.chats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await chatAPI.getMessages(chatId);
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleChatSelect = (chat) => {
    if (selectedChat?._id === chat._id) return;
    setSelectedChat(chat);
    fetchMessages(chat._id);
    if (socket) {
      socket.emit('joinChat', chat._id);
    }
  };

  const handleUserSelect = async (selectedUser) => {
    try {
      const response = await chatAPI.createChat(selectedUser._id);
      const newChat = response.data.chat;
      // Add new chat to the list if it doesn't exist
      if (!chats.some(chat => chat._id === newChat._id)) {
        setChats(prev => [newChat, ...prev]);
      }
      handleChatSelect(newChat);
    } catch (error) {
      toast.error('Failed to create or find chat');
    }
  };

  const handleSendMessage = async (messageData) => {
    if (!selectedChat) return;
    try {
      const isFile = !!messageData.file;
      const messagePayload = {
        chatId: selectedChat._id,
        content: messageData.content,
        messageType: messageData.messageType
      };

      if (socket && !isFile) {
        socket.emit('sendMessage', messagePayload);
      } else {
        const formData = new FormData();
        Object.keys(messagePayload).forEach(key => formData.append(key, messagePayload[key]));
        if (isFile) {
          formData.append('file', messageData.file);
        }
        const response = await chatAPI.sendMessage(formData);
        // Socket should ideally broadcast this message back, including to the sender
        // setMessages(prev => [...prev, response.data.message]);
        // fetchChats();
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    toast.success('Logged out successfully');
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = chat.participants.find(p => p._id !== user._id);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      bgcolor: darkMode ? 'grey.900' : 'grey.100', // Adjusted bgcolor for better contrast
      fontFamily: '"Poppins", "Roboto", sans-serif'
    }}>
      {/* Enhanced Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
              }}
            >
              A
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.02em', display: { xs: 'none', sm: 'block' } }}
            >
              Alpha Chat
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
            <Tooltip title={`${onlineUsers.length} users online`}>
              <Badge badgeContent={onlineUsers.length} color="success">
                <IconButton sx={{ color: 'white' }}>
                  <NotificationsActive />
                </IconButton>
              </Badge>
            </Tooltip>
            
            <Tooltip title="Toggle dark mode">
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                icon={<LightMode sx={{ color: 'yellow' }}/>}
                checkedIcon={<DarkMode />}
              />
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0, ml: 1 }}>
                <Avatar
                  src={user?.avatar}
                  alt={user?.name}
                  sx={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.3)' }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', width: '100%', pt: '64px' }}> {/* pt adds padding for fixed AppBar */}
        {/* Sidebar */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 380 },
            height: 'calc(100vh - 64px)',
            borderRight: `1px solid ${theme.palette.divider}`,
            display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            background: darkMode ? alpha(theme.palette.grey[900], 0.8) : 'white',
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: darkMode ? 'grey.800' : 'grey.200', borderRadius: 3, px: 2, py: 1.5 }}>
              <Search sx={{ color: 'text.secondary', mr: 1 }} />
              <input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none', outline: 'none', background: 'transparent', flex: 1,
                  fontSize: '0.9rem', color: darkMode ? 'white' : 'inherit'
                }}
              />
            </Box>
          </Box>

          <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
            <UserList
              users={users}
              onlineUsers={onlineUsers}
              onUserSelect={handleUserSelect}
            />
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <ChatList
              chats={filteredChats}
              selectedChat={selectedChat}
              onChatSelect={handleChatSelect}
              currentUser={user}
            />
          </Box>
        </Paper>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: { xs: selectedChat ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column' }}>
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              messages={messages}
              currentUser={user}
              onSendMessage={handleSendMessage}
              socket={socket}
            />
          ) : (
            <EmptyState darkMode={darkMode} />
          )}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2, minWidth: 200, mt: 1, p: 1 }
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight="bold">{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
        </Box>
        <MenuItem onClick={handleProfileMenuClose}>
          <Settings sx={{ mr: 1.5 }} /> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ExitToApp sx={{ mr: 1.5 }} /> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Dashboard;