
// LandingPage.tsx
import React, { useState } from 'react';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome to MessageApp</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {showLogin ? <LoginForm /> : <SignupForm />}
        <p className="mt-4 text-center">
          {showLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            className="text-orange-500 hover:underline"
            onClick={() => setShowLogin(!showLogin)}
          >
            {showLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;