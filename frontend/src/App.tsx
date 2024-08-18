
import './App.css';
import LandingPage from './components/Landingpage';
import ChatInterface from './components/ChatInterface';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/authContext';
import { SocketProvider } from './context/socketContext'; 
import { useContext } from 'react';

const AuthenticatedRoutes: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext) || { isAuthenticated: false };
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/chatinterface" /> : <LandingPage />} />
      <Route 
        path="/chatinterface" 
        element={
          isAuthenticated ? (
            <SocketProvider> 
              <ChatInterface />
            </SocketProvider>
          ) : (
            <Navigate to="/" />
          )
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthenticatedRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;