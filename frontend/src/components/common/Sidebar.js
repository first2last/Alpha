import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  Badge,
  Avatar,
  IconButton,
  Toolbar
} from '@mui/material';
import {
  Chat,
  People,
  Settings,
  Help,
  Info,
  Close,
  Add,
  Search
} from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';

const Sidebar = ({ 
  open, 
  onClose, 
  selectedTab = 'chats',
  onTabChange,
  variant = 'permanent',
  width = 280 
}) => {
  const { onlineUsers } = useSocket();

  const menuItems = [
    {
      id: 'chats',
      label: 'Chats',
      icon: Chat,
      badge: 0 // Could be unread messages count
    },
    {
      id: 'users',
      label: 'Users',
      icon: People,
      badge: onlineUsers.length
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const secondaryItems = [
    {
      id: 'help',
      label: 'Help & Support',
      icon: Help
    },
    {
      id: 'about',
      label: 'About',
      icon: Info
    }
  ];

  const handleItemClick = (itemId) => {
    if (onTabChange) {
      onTabChange(itemId);
    }
    
    // Close drawer on mobile
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar spacer for permanent drawer */}
      {variant === 'permanent' && <Toolbar />}
      
      {/* Header for temporary drawer */}
      {variant === 'temporary' && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" color="primary" fontWeight="bold">
            Alpha Chat
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      )}

      {/* Quick Actions */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <List dense>
          <ListItem disablePadding>
            <ListItemButton 
              sx={{ 
                borderRadius: 1,
                mb: 1,
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText 
                primary="New Chat" 
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              sx={{ 
                borderRadius: 1,
                backgroundColor: 'grey.100',
                '&:hover': {
                  backgroundColor: 'grey.200'
                }
              }}
            >
              <ListItemIcon>
                <Search />
              </ListItemIcon>
              <ListItemText primary="Search" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = selectedTab === item.id;
            
            return (
              <ListItem key={item.id} disablePadding sx={{ px: 2, mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleItemClick(item.id)}
                  sx={{
                    borderRadius: 1,
                    minHeight: 48,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light'
                      }
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isSelected ? 'primary.main' : 'inherit',
                      minWidth: 40 
                    }}
                  >
                    {item.badge > 0 ? (
                      <Badge badgeContent={item.badge} color="error">
                        <IconComponent />
                      </Badge>
                    ) : (
                      <IconComponent />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Online Users Preview */}
        {onlineUsers.length > 0 && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Online Now ({onlineUsers.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {onlineUsers.slice(0, 6).map((user) => (
                <Avatar
                  key={user.userId}
                  sx={{ width: 32, height: 32 }}
                  src={user.avatar}
                  title={user.name}
                >
                  {user.name?.charAt(0)}
                </Avatar>
              ))}
              {onlineUsers.length > 6 && (
                <Avatar sx={{ width: 32, height: 32, backgroundColor: 'grey.300' }}>
                  +{onlineUsers.length - 6}
                </Avatar>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Secondary Navigation */}
      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
        <List>
          {secondaryItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = selectedTab === item.id;
            
            return (
              <ListItem key={item.id} disablePadding sx={{ px: 2, mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleItemClick(item.id)}
                  sx={{
                    borderRadius: 1,
                    minHeight: 44,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main'
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isSelected ? 'primary.main' : 'inherit',
                      minWidth: 40 
                    }}
                  >
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Version Info */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Alpha Chat v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          borderRight: variant === 'permanent' ? 1 : 0,
          borderColor: 'divider'
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
