import io from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.eventListeners = new Map();
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('Socket connection failed:', error);
      toast.error('Failed to connect to chat server');
      return null;
    }
  }

  // Setup core event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      toast.success('Connected to chat server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect
        toast.error('Disconnected from chat server');
      } else {
        // Client initiated disconnect or network issue
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      
      if (error.message === 'Authentication error') {
        toast.error('Authentication failed. Please login again.');
        // Redirect to login or refresh token
        window.location.href = '/login';
      } else {
        this.handleReconnection();
      }
    });

    // Reconnection events
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      toast.success('Reconnected to chat server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect');
      toast.error('Failed to reconnect to chat server');
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error occurred');
    });
  }

  // Handle reconnection logic
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error('Unable to connect to chat server. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    toast.loading(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect();
      }
    }, this.reconnectInterval);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.eventListeners.clear();
      console.log('🔌 Socket disconnected');
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.socket) return;

    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event);
      this.eventListeners.delete(event);
    }
  }

  // Emit events
  emit(event, data, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot emit event:', event);
      toast.error('Not connected to chat server');
      return false;
    }

    try {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
      return true;
    } catch (error) {
      console.error('Error emitting event:', error);
      return false;
    }
  }

  // Chat-specific methods
  joinChat(chatId) {
    return this.emit('joinChat', chatId);
  }

  leaveChat(chatId) {
    return this.emit('leaveChat', chatId);
  }

  sendMessage(messageData) {
    return this.emit('sendMessage', messageData);
  }

  sendTyping(chatId, isTyping) {
    return this.emit('typing', { chatId, isTyping });
  }

  markAsRead(messageId, chatId) {
    return this.emit('markAsRead', { messageId, chatId });
  }

  // Call-specific methods
  initiateCall(chatId, callType, callData) {
    return this.emit('initiateCall', { chatId, callType, callData });
  }

  respondToCall(chatId, accepted, callData) {
    return this.emit('callResponse', { chatId, accepted, callData });
  }

  endCall(chatId) {
    return this.emit('endCall', { chatId });
  }

  // User presence methods
  updatePresence(status) {
    return this.emit('updatePresence', { status });
  }

  // File sharing methods
  shareFile(chatId, fileData) {
    return this.emit('shareFile', { chatId, ...fileData });
  }

  // Group chat methods
  createGroup(groupData) {
    return this.emit('createGroup', groupData);
  }

  joinGroup(groupId) {
    return this.emit('joinGroup', groupId);
  }

  leaveGroup(groupId) {
    return this.emit('leaveGroup', groupId);
  }

  updateGroup(groupId, updateData) {
    return this.emit('updateGroup', { groupId, ...updateData });
  }

  // Utility methods
  isConnected() {
    return this.isConnected && this.socket?.connected;
  }

  getSocket() {
    return this.socket;
  }

  // Event listener helpers for React components
  useSocketEvent(event, callback, deps = []) {
    React.useEffect(() => {
      if (this.socket) {
        this.on(event, callback);
        return () => this.off(event, callback);
      }
    }, deps);
  }

  // Cleanup method
  cleanup() {
    // Remove all event listeners
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach(callback => {
        this.off(event, callback);
      });
    });
    
    this.disconnect();
  }

  // Health check
  ping(callback) {
    if (!this.isConnected) {
      callback(false);
      return;
    }

    const startTime = Date.now();
    this.emit('ping', {}, () => {
      const latency = Date.now() - startTime;
      callback(true, latency);
    });
  }

  // Get connection stats
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
