import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Box,
  Button,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  ExitToApp,
  Person,
  VideoCall,
  Search,
  MoreVert
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const Header = ({ 
  onMenuToggle, 
  title = "Alpha Chat", 
  showMenuButton = true,
  onSearchClick,
  onVideoCallClick 
}) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);

  // Mock notifications data
  const [notifications] = useState([
    { id: 1, message: 'New message from John Doe', time: '2 min ago', read: false },
    { id: 2, message: 'Sarah joined the chat', time: '5 min ago', read: false },
    { id: 3, message: 'File shared in Project Alpha', time: '10 min ago', read: true }
  ]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
    handleProfileMenuClose();
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    // Navigate to profile page or open profile modal
    toast.info('Profile feature coming soon');
  };

  const handleSettingsClick = () => {
    handleProfileMenuClose();
    // Navigate to settings page or open settings modal
    toast.info('Settings feature coming soon');
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        {/* Menu Button */}
        {showMenuButton && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* App Title */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          {title}
        </Typography>

        {/* Online Users Count */}
        <Tooltip title={`${onlineUsers.length} users online`}>
          <Badge 
            badgeContent={onlineUsers.length} 
            color="success" 
            sx={{ mr: 2 }}
          >
            <Person />
          </Badge>
        </Tooltip>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search Button */}
          {onSearchClick && (
            <Tooltip title="Search">
              <IconButton color="inherit" onClick={onSearchClick}>
                <Search />
              </IconButton>
            </Tooltip>
          )}

          {/* Video Call Button */}
          {onVideoCallClick && (
            <Tooltip title="Start video call">
              <IconButton color="inherit" onClick={onVideoCallClick}>
                <VideoCall />
              </IconButton>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Tooltip title="Account">
            <IconButton 
              onClick={handleProfileMenuOpen}
              sx={{ p: 0, ml: 1 }}
            >
              <Avatar 
                src={user?.avatar}
                alt={user?.name}
                sx={{ width: 40, height: 40 }}
              >
                {getUserInitials(user?.name || 'User')}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{ mt: 1 }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />

        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ color: 'error' }}
          />
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 300 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        <Divider />

        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleNotificationMenuClose}
              sx={{
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected'
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: notification.read ? 'normal' : 'bold',
                    mb: 0.5
                  }}
                >
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        )}

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button 
            fullWidth 
            size="small" 
            onClick={handleNotificationMenuClose}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </AppBar>
  );
};

export default Header;
