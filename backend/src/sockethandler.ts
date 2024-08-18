


import { Server, Socket } from "socket.io";
import { db } from "./db";
import { messages, userStatus } from "./db/schema";
import { eq } from "drizzle-orm";

const connectedUsers = new Map();

export function setupSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    const getOnlineUsers = () => {
      const onlineUsers: { [key: string]: string } = {};
      for (const [socketId, userId] of connectedUsers.entries()) {
        onlineUsers[userId] = 'online';
      }
      return onlineUsers;
    };

    socket.on('login', async (userId) => {
      connectedUsers.set(socket.id, userId);
      try {
        await db.insert(userStatus).values({ userId, status: 'online', lastSeen: new Date() });
      } catch (error) {
        await db.update(userStatus)
          .set({ status: 'online', lastSeen: new Date() })
          .where(eq(userStatus.userId, userId));
      }
      
      // Emit the new user's status to all clients
      io.emit('userStatus', { userId, status: 'online' });
      
      // Send the list of all online users to the newly connected client
      socket.emit('onlineUsers', getOnlineUsers());
    });

      socket.on('join', ({ userId, otherUserId }) => {
        const roomId = [userId, otherUserId].sort().join('-');
        socket.join(roomId);
      });

    socket.on('sendMessage', async ({ senderId, receiverId, content, type }) => {
      console.log('Received sendMessage event:', { senderId, receiverId, content });
    
      try {
        // Parse senderId and receiverId to integers
        const parsedSenderId = parseInt(senderId);
        const parsedReceiverId = parseInt(receiverId);
    
        // Check if parsed values are valid integers
        if (isNaN(parsedSenderId) || isNaN(parsedReceiverId)) {
          throw new Error('Invalid senderId or receiverId: must be valid integers');
        }
    
        // Check if content is a non-empty string
        if (typeof content !== 'string' || content.trim() === '') {
          throw new Error('Invalid content: must be a non-empty string');
        }
    
        const [newMessage] = await db.insert(messages).values({
          senderId: parsedSenderId,
          receiverId: parsedReceiverId,
          content,
          type
        }).returning();
      
        console.log('New message inserted:', newMessage);
      
        const roomId = [parsedSenderId, parsedReceiverId].sort().join('-');
        io.to(roomId).emit('newMessage', newMessage);
    
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageSendError', { 
          error: 'Failed to send message', 
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      io.emit('userTyping', { userId: senderId, receiverId });
    });
    
    socket.on('stopTyping', ({ senderId, receiverId }) => {
      io.emit('userStoppedTyping', { userId: senderId, receiverId });
    });

    socket.on('disconnect', async () => {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        await db.update(userStatus)
          .set({ status: 'offline', lastSeen: new Date() })
          .where(eq(userStatus.userId, userId));
        io.emit('userStatus', { userId, status: 'offline' });
        connectedUsers.delete(socket.id);
      }
      console.log('User disconnected');
    });
  });
}