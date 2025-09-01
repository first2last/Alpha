import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Alert,
  Pagination,
  InputAdornment,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Search,
  Add,
  Block,
  CheckCircle,
  Cancel,
  PersonAdd,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  // Dialog states
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [addDialog, setAddDialog] = useState(false);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery.trim()) {
      filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mobile.includes(searchQuery)
      );
    }

    const totalFilteredPages = Math.ceil(filtered.length / usersPerPage);
    setTotalPages(totalFilteredPages);

    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    setFilteredUsers(filtered.slice(startIndex, endIndex));
  };

  const handleMenuOpen = (event, user) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role
    });
    setFormErrors({});
    setEditDialog({ open: true, user });
    handleMenuClose();
  };

  const handleDeleteUser = (user) => {
    setDeleteDialog({ open: true, user });
    handleMenuClose();
  };

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      role: 'user'
    });
    setFormErrors({});
    setAddDialog(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      
      if (editDialog.user) {
        // Update user
        await userAPI.updateProfile(formData);
        toast.success('User updated successfully');
        setUsers(prev => prev.map(u => 
          u._id === editDialog.user._id ? { ...u, ...formData } : u
        ));
        setEditDialog({ open: false, user: null });
      } else {
        // Add new user - This would require a backend endpoint
        toast.info('Add user functionality requires backend implementation');
        setAddDialog(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.user) return;

    try {
      setFormLoading(true);
      await userAPI.deleteUser(deleteDialog.user._id);
      toast.success('User deleted successfully');
      setUsers(prev => prev.filter(u => u._id !== deleteDialog.user._id));
      setDeleteDialog({ open: false, user: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleBlockUser = async (user) => {
    try {
      // This would require backend implementation
      toast.info('Block user functionality requires backend implementation');
      handleMenuClose();
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleMakeAdmin = async (user) => {
    try {
      // This would require backend implementation
      toast.info('Make admin functionality requires backend implementation');
      handleMenuClose();
    } catch (error) {
      toast.error('Failed to make user admin');
    }
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          User Management
        </Typography>
        {currentUser?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Box mb={3}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {users.filter(u => u.isOnline).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Online Now
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {users.filter(u => u.role === 'admin').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admins
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={user.avatar}>
                      {getUserInitials(user.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {user._id.slice(-8)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.mobile}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    size="small"
                    label={user.isOnline ? 'Online' : 'Offline'}
                    color={user.isOnline ? 'success' : 'default'}
                    icon={user.isOnline ? <CheckCircle /> : <Cancel />}
                  />
                </TableCell>
                
                <TableCell>
                  <Chip
                    size="small"
                    label={user.role}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    icon={user.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(user.createdAt)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  {currentUser?.role === 'admin' && user._id !== currentUser.id && (
                    <Tooltip title="Actions">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'No users found matching your search' : 'No users found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditUser(selectedUser)}>
          <Edit sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        
        {selectedUser?.role !== 'admin' && (
          <MenuItem onClick={() => handleMakeAdmin(selectedUser)}>
            <AdminPanelSettings sx={{ mr: 1 }} />
            Make Admin
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleBlockUser(selectedUser)}>
          <Block sx={{ mr: 1 }} />
          Block User
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleDeleteUser(selectedUser)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Edit/Add User Dialog */}
      <Dialog 
        open={editDialog.open || addDialog} 
        onClose={() => {
          setEditDialog({ open: false, user: null });
          setAddDialog(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editDialog.user ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={!!formErrors.name}
              helperText={formErrors.name}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={!!formErrors.email}
              helperText={formErrors.email}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Mobile Number"
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              error={!!formErrors.mobile}
              helperText={formErrors.mobile}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDialog({ open: false, user: null });
              setAddDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUser}
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={20} /> : (editDialog.user ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All user data and messages will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete user "{deleteDialog.user?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
