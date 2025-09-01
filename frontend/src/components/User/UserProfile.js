import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Phone,
  Email,
  CalendarToday,
  AdminPanelSettings,
  Person,
  CheckCircle,
  Schedule,
  Message,
  VideoCall,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';

const UserProfile = ({ userId, onClose, onStartChat, onStartCall }) => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const fileInputRef = useRef(null);
  const isOwnProfile = !userId || userId === currentUser?.id;

  React.useEffect(() => {
    if (isOwnProfile) {
      setUser(currentUser);
      setFormData({
        name: currentUser?.name || '',
        mobile: currentUser?.mobile || ''
      });
      setLoading(false);
    } else {
      fetchUserProfile();
    }
  }, [userId, currentUser, isOwnProfile]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserProfile(userId);
      setUser(response.data.user);
      setFormData({
        name: response.data.user.name,
        mobile: response.data.user.mobile
      });
    } catch (error) {
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing
      setFormData({
        name: user.name,
        mobile: user.mobile
      });
      setFormErrors({});
    }
    setEditing(!editing);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await userAPI.updateProfile(formData);
      
      // Update local state
      setUser(prev => ({ ...prev, ...formData }));
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);

      // This would require a backend endpoint for avatar upload
      // For now, we'll show a placeholder message
      toast.info('Avatar upload functionality requires backend implementation');
      
      // const response = await userAPI.uploadAvatar(formData);
      // setUser(prev => ({ ...prev, avatar: response.data.avatar }));
      // toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getUserInitials = (name) => {
    return name
      ?.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
  };

  const getLastSeenText = (lastSeen, isOnline) => {
    if (isOnline) return 'Online now';
    if (!lastSeen) return 'Last seen unknown';
    return `Last seen ${moment(lastSeen).fromNow()}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error">User not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={3}>
          {/* Avatar */}
          <Box position="relative">
            <Avatar
              src={user.avatar}
              sx={{ width: 120, height: 120, fontSize: '2rem' }}
            >
              {getUserInitials(user.name)}
            </Avatar>
            
            {isOwnProfile && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' }
                }}
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? <CircularProgress size={16} /> : <PhotoCamera />}
              </IconButton>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>

          {/* User Info */}
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h4" fontWeight="bold">
                {user.name}
              </Typography>
              <Chip
                size="small"
                label={user.role}
                color={user.role === 'admin' ? 'primary' : 'default'}
                icon={user.role === 'admin' ? <AdminPanelSettings /> : <Person />}
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: user.isOnline ? 'success.main' : 'grey.400'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {getLastSeenText(user.lastSeen, user.isOnline)}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={1}>
              {!isOwnProfile && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Message />}
                    onClick={() => onStartChat?.(user)}
                  >
                    Message
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<VideoCall />}
                    onClick={() => onStartCall?.(user)}
                  >
                    Call
                  </Button>
                </>
              )}
              
              {isOwnProfile && (
                <Button
                  variant={editing ? "outlined" : "contained"}
                  startIcon={editing ? <Cancel /> : <Edit />}
                  onClick={handleEditToggle}
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Profile Information
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Full Name"
                    secondary={
                      editing ? (
                        <TextField
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          error={!!formErrors.name}
                          helperText={formErrors.name}
                          size="small"
                          fullWidth
                          sx={{ mt: 1 }}
                        />
                      ) : (
                        user.name
                      )
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mobile"
                    secondary={
                      editing ? (
                        <TextField
                          value={formData.mobile}
                          onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                          error={!!formErrors.mobile}
                          helperText={formErrors.mobile}
                          size="small"
                          fullWidth
                          sx={{ mt: 1 }}
                        />
                      ) : (
                        user.mobile
                      )
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={moment(user.createdAt).format('MMMM DD, YYYY')}
                  />
                </ListItem>
              </List>

              {editing && (
                <Box mt={2} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity & Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Activity Status
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CheckCircle color={user.isOnline ? 'success' : 'disabled'} />
                <Typography variant="body2">
                  {user.isOnline ? 'Currently Online' : 'Currently Offline'}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Schedule color="action" />
                <Typography variant="body2" color="text.secondary">
                  {getLastSeenText(user.lastSeen, user.isOnline)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Account Settings - Only for own profile */}
          {isOwnProfile && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Account Settings
                </Typography>
                
                <List dense>
                  <ListItem button>
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Privacy Settings" 
                      secondary="Manage who can see your info"
                    />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <CheckCircle />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Account Verification" 
                      secondary="Verify your account"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Close Button for Modal */}
      {onClose && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
