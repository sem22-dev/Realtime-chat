
// AllMessages.tsx

import React, { useState, useEffect } from 'react';

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  read: boolean;
  senderUsername: string;
  senderEmail: string;
}

interface SenderUser {
  id: number;
  username: string;
  email: string;
}

interface AllMessagesProps {
  currentUserId: number;
  onSelectUser: (user: SenderUser) => void;
  handleLogout: () => void;
}

const AllMessages: React.FC<AllMessagesProps> = ({ currentUserId, onSelectUser, handleLogout }) => {
  const [latestMessages, setLatestMessages] = useState<Message[]>([]);

  console.log('latest :', latestMessages)

  useEffect(() => {
    fetchLatestMessages();
  }, [currentUserId]);

  const handleUserSelect = async (senderUser: SenderUser) => {
    try {
      const response = await fetch(`https://hirychat.onrender.com/api/mark-messages-read`, {
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
      setLatestMessages(prevMessages =>
        prevMessages.map(message =>
          message.senderId === senderUser.id
            ? { ...message, read: true }
            : message
        )
      );

      // Call the original onSelectUser function
      onSelectUser(senderUser);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const fetchLatestMessages = async () => {
    try {
      const response = await fetch(`https://hirychat.onrender.com/api/latest-messages?userId=${currentUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest messages');
      }
      const data = await response.json();
      setLatestMessages(data.messages);
    } catch (error) {
      console.error("Error fetching latest messages:", error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto relative border">
      {latestMessages.map((message) => {
        const senderUser: SenderUser = {
          id: message.senderId,
          username: message.senderUsername,
          email: message.senderEmail,
        };
        return (
          <div
            key={message.senderId}
            onClick={() => handleUserSelect(senderUser)}
            className="flex items-center p-4 cursor-pointer hover:bg-gray-100"
          >
           <div 
            className="w-12 h-12 p-4 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3"
          >
            {message.senderUsername.charAt(0).toUpperCase()}
          </div>

            <div className="flex-1">
              <p className="font-semibold">{message.senderUsername}</p>
              <p className={`text-sm ${message.read ? 'text-gray-500' : 'text-black font-semibold'} truncate`}>
                {message.content}
              </p>
            </div>
            {!message.read && (
              <div className="flex flex-col items-end">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            )}
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

export default AllMessages;