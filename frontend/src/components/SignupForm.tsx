import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '.././context/authContext';
import EmailVerificationForm from './EmailVerificationForm'; // New component we'll create

interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
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
      await axios.post('http://localhost:8080/api/signup', formData);
      setShowVerification(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'An error occurred during signup.');
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
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username" 
        className="w-full p-2 border rounded"
        required
      />
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
        className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
        disabled={isLoading}
      >
        {isLoading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm;
