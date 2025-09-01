const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getChats,
  createChat,
  getMessages,
  sendMessage,
  deleteMessage
} = require('../controllers/chatController');

const router = express.Router();

// All routes are protected
router.use(auth);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:chatId/messages', getMessages);
router.post('/message', upload.single('file'), sendMessage);
router.delete('/message/:messageId', deleteMessage);

module.exports = router;
