
// MessageInput.tsx

import React, { useRef } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { LuSendHorizonal } from 'react-icons/lu';

interface MessageInputProps {
  inputMessage: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  sendMessage: () => void;
  handleFileUpload: (file: File) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputMessage,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  sendMessage,
  handleFileUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          placeholder="Type your message here"
          className="w-full p-3 pr-20 rounded-lg border border-gray-300 bg-[#F6F6F6]"
        />
        <button
          onClick={triggerFileUpload}
          className="absolute right-12 p-2 top-1/2 transform -translate-y-1/2 text-red-500"
        >
          <GrAttachment className='h-5 w-5'/>

        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*,video/*"
          className="hidden"
        />
        <button
          onClick={sendMessage}
          className="absolute right-2 rounded-md p-2 top-1/2 transform -translate-y-1/2 hover:bg-[#FFE7E2] text-red-500"
        >
          <LuSendHorizonal className='h-5 w-5'/>

        </button>
      </div>
    </div>
  );
};

export default MessageInput;