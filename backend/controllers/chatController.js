const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User'); // Kept for potential future use
const FileUploadUtil = require('../utils/fileUpload'); // Using the cleaner utility from the updated version

/**
 * @desc Get all chats for the logged-in user
 * @route GET /api/chats
 * @access Private
 */
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name email avatar isOnline')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' }
      })
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching chats' });
  }
};

/**
 * @desc Create a new one-on-one chat or get an existing one
 * @route POST /api/chats
 * @access Private
 */
exports.createChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user.id;

    if (!participantId) {
        return res.status(400).json({ success: false, message: 'Participant ID is required' });
    }

    // Check if a one-on-one chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [currentUserId, participantId], $size: 2 }
    }).populate('participants', 'name email avatar isOnline');

    // If chat doesn't exist, create it
    if (!chat) {
      chat = new Chat({
        participants: [currentUserId, participantId],
        isGroupChat: false,
      });
      await chat.save();
      await chat.populate('participants', 'name email avatar isOnline');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating chat' });
  }
};

/**
 * @desc Get all messages for a specific chat with pagination
 * @route GET /api/chats/:chatId/messages
 * @access Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Security Check: Ensure the user is a participant of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or you are not a member' });
    }

    const messages = await Message.find({ chatId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Using the clean response format from the updated version
    const formattedMessages = messages.reverse().map(msg => ({
      _id: msg._id,
      content: msg.content,
      messageType: msg.messageType,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      sender: msg.sender, // The sender is already populated
      createdAt: msg.createdAt,
      status: msg.status
    }));

    res.json({ success: true, messages: formattedMessages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to get messages' });
  }
};

/**
 * @desc Send a new message in a chat
 * @route POST /api/chats/messages
 * @access Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType } = req.body;
    const userId = req.user.id;

    // Security Check: Ensure the user is a participant of the chat
    const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
    });

    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found or you are not a member' });
    }

    let messageData = {
      chatId, // Mongoose uses 'chatId', but schema might be 'chat'. Let's stick to chatId from body.
      chat: chatId, // Assuming schema field is 'chat'
      sender: userId,
      content: content || '',
      messageType: messageType || 'text'
    };

    // Handle file upload if a file is present
    if (req.file) {
      const uploadResult = await FileUploadUtil.uploadToCloudinary(req.file, {
        folder: 'alpha-chat-media',
        resource_type: 'auto'
      });

      messageData.fileUrl = uploadResult.secure_url;
      messageData.fileName = req.file.originalname;
      messageData.fileSize = req.file.size;
      // For file messages, content can be the URL or an optional caption. Let's keep it flexible.
      if (!messageData.content) {
        messageData.content = uploadResult.secure_url;
      }
    }

    const message = new Message(messageData);
    await message.save();
    await message.populate('sender', 'name email avatar');

    // Update the chat's last message atomically
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    await chat.save();

    res.status(201).json({ success: true, message });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

/**
 * @desc Delete a message sent by the user
 * @route DELETE /api/chats/messages/:messageId
 * @access Private
 */
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const currentUserId = req.user.id;

        const message = await Message.findOne({
            _id: messageId,
            sender: currentUserId // Ensure only the sender can delete their message
        });

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found or you do not have permission to delete it' });
        }

        await Message.findByIdAndDelete(messageId);

        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting message' });
    }
};