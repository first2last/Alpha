const express = require('express');
const auth = require('../middleware/auth');
const {
  getAllUsers,
  searchUsers,
  getUserProfile,
  updateProfile,
  deleteUser,
  getOnlineUsers
} = require('../controllers/userController');

const router = express.Router();

// All routes are protected
router.use(auth);

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/online', getOnlineUsers);
router.get('/:userId', getUserProfile);
router.put('/profile', updateProfile);
router.delete('/:userId', deleteUser);

module.exports = router;
