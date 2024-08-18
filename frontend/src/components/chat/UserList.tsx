
import React from 'react';

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  handleUserSelect: (user: User) => void;
  handleLogout: () => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUser, handleUserSelect, handleLogout }) => {

  console.log('usershaha: ' , users)

  return (
    <div className="flex-1 overflow-y-auto relative border">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => handleUserSelect(user)}
          className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${
            selectedUser && selectedUser.id === user.id ? 'bg-gray-100' : ''
          }`}
        >
          <div 
            className="w-12 h-12 p-4 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3"
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user.username}</p>
            <p className="text-sm text-gray-500">
              user id : {user.id}
            </p>
          </div>
        </div>
      ))}
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

export default UserList;