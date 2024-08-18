
import React, { useState, useEffect } from 'react';

interface Message {
  content: string;
  isSender: boolean;
  timestamp: Date;
  type: 'text' | 'image' | 'video';
}

interface ChatMessagesProps {
  messages: Message[];
  messageContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, messageContainerRef }) => {
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);

  useEffect(() => {
    console.log('Messages:', messages); // Debug log
  }, [messages]);

  const isMediaUrl = (content: string) => {
    return typeof content === 'string' && content.startsWith('http') && (content.includes('/uploads/') || content.includes('/api/file/'));
  };
  
  const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) {
      return 'video';
    }
    return 'unknown';
  };

  const renderMessageContent = (message: Message) => {
    console.log('Rendering message:', message); // Debug log
  
    if (!message.content) {
      return <p className="text-red-500">Error: No content</p>;
    }
  
    if (message.type === 'text' && !isMediaUrl(message.content)) {
      return <p>{message.content}</p>;
    }
  
    const mediaUrl = message.content;
    const mediaType = getMediaType(mediaUrl);
  
    if (mediaType === 'image') {
      console.log('Rendering image with URL:', mediaUrl); // Debug log
      return (
        <div className="relative group">
          <img 
            src={mediaUrl} 
            alt="Uploaded image" 
            className="max-w-[200px] max-h-[200px] object-contain cursor-pointer" 
            onClick={() => setFullscreenMedia(mediaUrl)}
            onError={(e) => {
              console.error('Image load error:', mediaUrl);
              e.currentTarget.src = 'path/to/fallback/image.png'; // Replace with a path to a fallback image
            }}
          />
        </div>
      );
    }
  
    if (mediaType === 'video') {
      console.log('Rendering video with URL:', mediaUrl); // Debug log
      return (
        <video 
          src={mediaUrl} 
          controls 
          className="max-w-[200px] max-h-[200px] object-contain"
          onError={() => console.error('Video load error:', mediaUrl)} // Debug log
        >
          Your browser does not support the video tag.
        </video>
      );
    }
  
    return <p className="text-red-500">Unsupported media type for: {mediaUrl}</p>;
  };

  return (
    <>
      <div ref={messageContainerRef} className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.isSender ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.isSender
                  ? 'bg-[#EF6144] text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {renderMessageContent(message)}
              <span
                className={`text-xs mt-1 block ${
                  message.isSender ? 'text-gray-200' : 'text-gray-500'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
      {fullscreenMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setFullscreenMedia(null)}
        >
          <img 
            src={fullscreenMedia} 
            alt="Fullscreen media" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
};

export default ChatMessages;