
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/socketContext';

interface UnreadMessage {
  receiverId: number;
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  senderUsername: string;
  senderEmail: string;
}

interface SenderUser {
  id: number;
  username: string;
  email: string;
}

interface InboxProps {
  currentUserId: number;
  onSelectUser: (user: SenderUser) => void;
  handleLogout: () => void;
}

const Inbox: React.FC<InboxProps> = ({ currentUserId, onSelectUser, handleLogout }) => {
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);
  const socket = useSocket();

  const handleUserSelect = async (senderUser: SenderUser) => {
    try {
      const response = await fetch(`http://localhost:8080/api/mark-messages-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: senderUser.id,
          receiverId: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      // Update local state to reflect the change
      setUnreadMessages(prevMessages => 
        prevMessages.filter(message => message.senderId !== senderUser.id)
      );

      // Call the original onSelectUser function
      onSelectUser(senderUser);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message: Omit<UnreadMessage, 'senderUsername' | 'senderEmail'>) => {
        if (message.receiverId === currentUserId) {
          setUnreadMessages(prevMessages => {
            const existingSender = prevMessages.find(m => m.senderId === message.senderId);
            if (existingSender) {
              return [
                {
                  ...message,
                  senderUsername: existingSender.senderUsername,
                  senderEmail: existingSender.senderEmail
                },
                ...prevMessages.filter(m => m.id !== message.id)
              ];
            } else {
              // If we don't have sender info, use placeholders
              return [
                {
                  ...message,
                  senderUsername: 'Unknown',
                  senderEmail: 'unknown@example.com'
                },
                ...prevMessages
              ];
            }
          });
        }
      });
    }
  }, [socket, currentUserId]);

  useEffect(() => {
    fetchUnreadMessages();
  }, [currentUserId]);

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/unread-messages?userId=${currentUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch unread messages');
      }
      const data = await response.json();
      setUnreadMessages(data.messages);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  // Group messages by sender
  const groupedMessages = unreadMessages.reduce((acc, message) => {
    if (!acc[message.senderId]) {
      acc[message.senderId] = [];
    }
    acc[message.senderId].push(message);
    return acc;
  }, {} as Record<number, UnreadMessage[]>);

  return (
    <div className="flex-1 overflow-y-auto relative border">
      {Object.entries(groupedMessages).map(([senderId, messages]) => {
        const latestMessage = messages[0]; // Messages are already sorted by timestamp desc
        const senderUser: SenderUser = {
          id: Number(senderId),
          username: latestMessage.senderUsername,
          email: latestMessage.senderEmail,
        };
        return (
          <div
            key={senderId}
            onClick={() => handleUserSelect(senderUser)}
            className="flex items-center p-4 cursor-pointer hover:bg-gray-100"
          >
              <div 
            className="w-12 h-12 p-4 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3"
          >
            {latestMessage.senderUsername.charAt(0).toUpperCase()}
          </div>
            <div className="flex-1">
              <p className="font-semibold">{latestMessage.senderUsername}</p>
              <p className="text-sm text-gray-500 truncate">
                {latestMessage.content}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {messages.length}
              </div>
            </div>
          </div>
        );
      })}
       <div className="absolute bottom-4 left-1/2 w-12 h-12 flex items-center justify-center transform -translate-x-1/2 bg-gray-200 p-2 rounded-full shadow-lg">
        <button className="text-red-500" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Inbox;