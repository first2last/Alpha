import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import { 
  Add,
  Circle,
  VideoCall,
  Message
} from '@mui/icons-material';

const UserList = ({ users, onlineUsers, onUserSelect, darkMode }) => {
  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId);
  };

  return (
    <Box>
      <Box 
        sx={{ 
          px: 2, 
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography 
          variant="subtitle2" 
          fontWeight={600}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          Online ({onlineUsers.length})
        </Typography>
        <Tooltip title="Add user">
          <IconButton size="small">
            <Add />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 1 }}>
        {users.slice(0, 5).map((user) => (
          <Box
            key={user._id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: darkMode 
                  ? alpha('#fff', 0.08)
                  : alpha('#000', 0.04),
                transform: 'translateY(-1px)'
              }
            }}
            onClick={() => onUserSelect(user)}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Circle 
                  sx={{ 
                    color: isUserOnline(user._id) ? '#4caf50' : '#bdbdbd',
                    fontSize: 12
                  }} 
                />
              }
            >
              <Avatar
                src={user.avatar}
                sx={{ 
                  width: 44, 
                  height: 44,
                  border: isUserOnline(user._id) 
                    ? '2px solid #4caf50'
                    : '2px solid transparent'
                }}
              >
                {user.name?.charAt(0)}
              </Avatar>
            </Badge>

            <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={500}
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {isUserOnline(user._id) ? 'Online' : 'Offline'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Message">
                <IconButton size="small" sx={{ opacity: 0.7 }}>
                  <Message fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Video call">
                <IconButton size="small" sx={{ opacity: 0.7 }}>
                  <VideoCall fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default UserList;
