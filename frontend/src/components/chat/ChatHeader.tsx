
// ChatHeader.tsx

interface ChatHeaderProps {
  selectedUser: { id: number; username: string } | null;
  userStatuses: { [key: number]: string };
  typingUsers: { [key: number]: boolean };
  isMobileView: boolean;
  onBackClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  selectedUser, 
  userStatuses, 
  typingUsers, 
  isMobileView,
  onBackClick
}) => (
  <div className="flex items-center p-4 bg-[#F6F6F6] ">
    {isMobileView && (
      <button onClick={onBackClick} className="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    )}
    {selectedUser && (
      <>
        <div 
            className="w-12 h-12 p-4 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3"
          >
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
        <div>
          <p className="font-semibold flex items-center">
            {selectedUser.username}
            {userStatuses[selectedUser.id] === 'online' && (
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </p>
          {typingUsers[selectedUser.id] ? (
            <p className="text-sm text-gray-500">Typing...</p>
          ) : (
            <p className="text-sm text-gray-500">{userStatuses[selectedUser.id]}</p>
          )}
        </div>
      </>
    )}
  </div>
);

export default ChatHeader;