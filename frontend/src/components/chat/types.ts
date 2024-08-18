
// src/types.ts

export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: string;
    read: boolean;
    isSender: boolean;
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
  }