
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/authContext';
import { useSocket } from '../context/socketContext';
import Modal from './Modal';
import SearchBar from './chat/SearchBar';
import UserList from './chat/UserList';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import MessageInput from './chat/MessageInput';
import Inbox from './chat/Inbox';
import AllMessages from './chat/AllMessages';
import axios from 'axios';


interface User {
  id: number;
  username: string;
  email: string;
}

interface Message {
  timestamp: any;
  content: string;
  isSender: boolean;
  type: 'text' | 'image' | 'video';  // Add this line
}

const ChatInterface = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const authContext = useContext(AuthContext);
  const socket = useSocket();
  const [userStatuses, setUserStatuses] = useState<{[key: number]: string}>({});
  const [typingUsers, setTypingUsers] = useState<{[key: number]: boolean}>({});
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const [tabs, setTab] = useState('All')


  if (!authContext) {
    throw new Error('AuthContext is not available');
  }

  const { logout, userId, username } = authContext;

    useEffect(() => {
      const handleResize = () => {
        setIsMobileView(window.innerWidth < 768);
      };
  
      handleResize(); 
      window.addEventListener('resize', handleResize);
  
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchMessages(user.id);
    if (socket && userId) {
      socket.emit('join', { userId, otherUserId: user.id });
    }
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
  };

  const fetchMessages = async (otherUserId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/messages?userId1=${userId}&userId2=${otherUserId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();

      const isMediaUrl = (url: string): boolean => {
        // Check if the URL ends with common image/video file extensions
        const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp4', 'mov', 'avi', 'mkv'];
        const extension = url.split('.').pop()?.toLowerCase();
        return mediaExtensions.includes(extension || '');
      };
      
  
      // Format the messages with inferred type if not provided
      const formattedMessages = data.messages.map((msg: any) => ({
        content: msg.content,
        isSender: msg.isSender,
        timestamp: new Date(msg.timestamp),
        type: msg.type || (isMediaUrl(msg.content) ? 'image' : 'text') // Infer type if not provided
      }));
  
      // Set the messages state with formatted messages
      setMessages(formattedMessages);
  
      // Scroll to the bottom of the chat after messages are set
      setTimeout(scroll, 0);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/');
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      const users = data.data;

      const filteredUsers = users.filter((user: { username: string; }) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (socket && selectedUser && userId) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('senderId', userId);
      formData.append('receiverId', selectedUser.id.toString());
  
      try {
        const response = await axios.post('http://localhost:8080/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.data.url) {
          socket.emit('sendMessage', {
            senderId: parseInt(userId, 10),
            receiverId: selectedUser.id,
            content: response.data.url,
            type: file.type.startsWith('image/') ? 'image' : 'video',
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }; 

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    setIsModalOpen(false);
    logout();
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: any) => {
        console.log('Received new message:', message);
        setMessages((prevMessages) => {
          // Check if the message already exists in the state
          const messageExists = prevMessages.some(
            (msg) => 
              msg.content === message.content && 
              msg.timestamp === message.timestamp
          );
          
          if (!messageExists) {
            const newMessages = [...prevMessages, {
              content: message.content,
              isSender: message.senderId === parseInt(userId as string, 10),
              timestamp: new Date(message.timestamp),
              type: message.type || 'text'  // Add this line
            }];
            
            // Schedule scrolling after the state update
            setTimeout(scrollToBottom, 0);
            
            return newMessages;
          }
          return prevMessages;
        });
      };
  
      socket.on('newMessage', handleNewMessage);
  
      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket, userId]);
  

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const sendMessage = () => {
    if (socket && inputMessage.trim() !== '' && selectedUser && userId) {
      socket.emit('sendMessage', {
        senderId: parseInt(userId, 10),
        receiverId: selectedUser.id,
        content: inputMessage,
      });
      
      setInputMessage('');
      setTimeout(scrollToBottom, 0)
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (socket && selectedUser && userId) {
      socket.emit('typing', { senderId: parseInt(userId, 10), receiverId: selectedUser.id });
    }
  };
  
  useEffect(() => {
    if (socket && userId) {
      socket.emit('login', userId);
  
      const handleUserStatus = (data: { userId: number; status: string }) => {
        console.log('User status update:', data);
        setUserStatuses(prev => ({ ...prev, [data.userId]: data.status }));
      };
  
      const handleOnlineUsers = (onlineUsers: { [key: string]: string }) => {
        console.log('Received online users:', onlineUsers);
        setUserStatuses(prev => ({ ...prev, ...onlineUsers }));
      };
  
      const handleTyping = (data: { userId: number, receiverId: number }) => {
        if (data.receiverId === parseInt(userId, 10)) {
          setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
        }
      };
  
      const handleStopTyping = (data: { userId: number }) => {
        console.log('User stopped typing:', data);
        setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
      };
  
      socket.on('userStatus', handleUserStatus);
      socket.on('onlineUsers', handleOnlineUsers);
      
      socket.on('userTyping', handleTyping);
      socket.on('userStoppedTyping', handleStopTyping);

      return () => {
        socket.off('userStatus', handleUserStatus);
        socket.off('onlineUsers', handleOnlineUsers);
        socket.off('userTyping', handleTyping);
        socket.off('userStoppedTyping', handleStopTyping);
        socket.emit('logout', userId);
      };
    }
  }, [socket, userId]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };
  
  const handleInputFocus = () => {
    if (socket && selectedUser && userId) {
      socket.emit('typing', { senderId: parseInt(userId, 10), receiverId: selectedUser.id });
    }
  };
  
  const handleInputBlur = () => {
    if (socket && selectedUser && userId) {
      socket.emit('stopTyping', { senderId: parseInt(userId, 10), receiverId: selectedUser.id });
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Left sidebar */}
      <div className={`${
        isMobileView && selectedUser ? 'hidden' : 'w-full md:w-1/3'
      } border-r border-gray-200 flex flex-col`}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        {/* Filter tabs */}
        {!searchQuery && 
          <div className="flex gap-3 border-b border-[#ebebeb] overflow-hidden px-4 py-3 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setTab('All')}
            className={`px-4 py-1 rounded-full text-sm w-fit font-medium border ${tabs === 'All' ? 'text-white bg-[#EF6144] ' : 'text-gray-500'} `}
          >
            All
          </button>
          <button 
           onClick={() => setTab('unread')}
           className={`px-4 py-1 rounded-full text-sm w-fit font-medium border ${tabs === 'unread' ? 'text-white bg-[#EF6144] ' : 'text-gray-500'} `}
          >
            Unread
          </button>

          <button 
           onClick={() => setTab('archived')}
           className={`px-4 py-1 rounded-full text-sm w-fit font-medium border ${tabs === 'archived' ? 'text-white bg-[#EF6144] ' : 'text-gray-500'} `}
          >
            Archived
          </button>

          <button 
           onClick={() => setTab('blocked')}
           className={`px-4 py-1 rounded-full text-sm w-fit font-medium border ${tabs === 'blocked' ? 'text-white bg-[#EF6144] ' : 'text-gray-500'} `}
          >
            Blocked
          </button>
        </div>
        }

        {
  searchQuery ? (
    <UserList
      users={users}
      selectedUser={selectedUser}
      handleUserSelect={handleUserSelect}
      handleLogout={handleLogout}
    />
  ) : tabs === 'unread' ? (
    <Inbox 
      currentUserId={userId ? parseInt(userId) : 0}
      onSelectUser={handleUserSelect}
      handleLogout={handleLogout}
    />
  ) : tabs === 'All' ? (
    <AllMessages 
      currentUserId={userId ? parseInt(userId) : 0}
      onSelectUser={handleUserSelect}
      handleLogout={handleLogout}
    />
  ) : null
}         

      </div>

      {/* Right chat area */}
      <div className={`${
        isMobileView && !selectedUser ? 'hidden' : 'flex-1'
      } flex flex-col`}>
        {selectedUser ? (
          <>
            <ChatHeader 
              selectedUser={selectedUser}
              userStatuses={userStatuses}
              typingUsers={typingUsers}
              isMobileView={isMobileView}
              onBackClick={handleBackToUserList}
            />
            <ChatMessages 
              messages={messages}
              messageContainerRef={messageContainerRef}
            />
            <MessageInput 
              inputMessage={inputMessage}
              handleInputChange={handleInputChange}
              handleInputFocus={handleInputFocus}
              handleInputBlur={handleInputBlur}
              sendMessage={sendMessage}
              handleFileUpload={handleFileUpload}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        username={username || 'User'}
      />
    </div>
  );
};

export default ChatInterface;
