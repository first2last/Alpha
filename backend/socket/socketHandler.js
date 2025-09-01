const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error'));
      }
      
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { 
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user to their own room
    socket.join(socket.userId);

    // Join user to all their chat rooms
    const userChats = await Chat.find({ participants: socket.userId });
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });

    // Broadcast user online status
    socket.broadcast.emit('userOnline', {
      userId: socket.userId,
      name: socket.user.name
    });

    // Handle joining a chat room
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user.name} joined chat ${chatId}`);
    });

    // Handle leaving a chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.user.name} left chat ${chatId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content, messageType = 'text' } = data;

        // Verify user is participant of the chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Create message
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content,
          messageType
        });

        await message.save();
        await message.populate('sender', 'name avatar');

        // Update chat's last message
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.save();

        // Emit message to all participants
        io.to(chatId).emit('newMessage', {
          message,
          chatId
        });

        // Emit chat update
        const populatedChat = await Chat.findById(chatId)
          .populate('participants', 'name avatar isOnline')
          .populate('lastMessage');
        
        chat.participants.forEach(participant => {
          io.to(participant._id.toString()).emit('chatUpdated', populatedChat);
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('userTyping', {
        userId: socket.userId,
        name: socket.user.name,
        isTyping
      });
    });

    // Handle message read status
    socket.on('markAsRead', async ({ messageId, chatId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: {
              user: socket.userId,
              readAt: new Date()
            }
          }
        });

        socket.to(chatId).emit('messageRead', {
          messageId,
          userId: socket.userId
        });
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle video call initiation
    socket.on('initiateCall', ({ chatId, callType, callData }) => {
      socket.to(chatId).emit('incomingCall', {
        from: socket.userId,
        fromName: socket.user.name,
        callType,
        callData,
        chatId
      });
    });

    // Handle call response
    socket.on('callResponse', ({ chatId, accepted, callData }) => {
      socket.to(chatId).emit('callResponse', {
        from: socket.userId,
        accepted,
        callData
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.name} disconnected`);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast user offline status
      socket.broadcast.emit('userOffline', {
        userId: socket.userId,
        name: socket.user.name
      });
    });
  });
};

module.exports = socketHandler;
