
import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '.././context/authContext';

interface EmailVerificationFormProps {
  email: string;
}

const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({ email }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext) || { login: () => {} };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://hirychat.onrender.com/api/verify-email', {
        email,
        verificationCode
      });
      login(response.data.token, response.data.user.id, response.data.user.username);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'An error occurred during verification.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Verify Your Email</h2>
      <p>We've sent a verification code to {email}. Please enter it below.</p>
      {error && <div className="text-red-500">{error}</div>}
      <input 
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="Verification Code" 
        className="w-full p-2 border rounded"
        required
      />
      <button 
        type="submit" 
        className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
        disabled={isLoading}
      >
        {isLoading ? 'Verifying...' : 'Verify Email'}
      </button>
    </form>
  );
};

export default EmailVerificationForm;