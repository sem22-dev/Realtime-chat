
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, userId: string, username: string) => void;
  logout: () => void;
  userId: string | null;
  username: string | null;  
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');  
    setIsAuthenticated(!!token);
    setUserId(storedUserId);
    setUsername(storedUsername);  
  }, []);

  const login = (token: string, userId: string, username: string) => { 
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);  
    setIsAuthenticated(true);
    setUserId(userId);
    setUsername(username);  
    navigate('/chatinterface');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');  
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);  
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userId, username }}>
      {children}
    </AuthContext.Provider>
  );
};