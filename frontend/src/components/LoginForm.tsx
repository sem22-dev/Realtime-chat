import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '.././context/authContext';
import EmailVerificationForm from './EmailVerificationForm';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const { login } = useContext(AuthContext) || { login: () => {} };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://hirychat.onrender.com/api/login', formData);
      console.log('Login response:', response.data);
      
      if (response.data.isVerified) {
        // Assuming the API returns the username in the user object
        const username = response.data.user.username || response.data.user.email;
        login(response.data.token, response.data.user.id, username);
        console.log('Login successful');
      } else {
        setShowVerification(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (axios.isAxiosError(err) && err.response) {
        console.log('Error response:', err.response.data);
        setError(err.response.data.message || 'An error occurred during login.');
        if (err.response.data.isVerified === false) {
          setShowVerification(true);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return <EmailVerificationForm email={formData.email} />;
  }

return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <input 
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email" 
        className="w-full p-2 border rounded"
        required
      />
      <input 
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password" 
        className="w-full p-2 border rounded"
        required
      />
      <button 
        type="submit" 
        className="w-full bg-orange-500 text-white p-2 border rounded hover:bg-orange-600"
        disabled={isLoading}
      >
        {isLoading ? 'Logging In...' : 'Log In'}
      </button>
    </form>
    
  );
};

export default LoginForm;