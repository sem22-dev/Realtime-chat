
// LandingPage.tsx
import React, { useState } from 'react';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className=" text-xl lg:text-3xl font-bold mb-8 px-4 text-center text-gray-800">
        Connect with friends and colleagues in real-time
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md mx-4 lg:w-96">
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
      <a href='https://twitter.com/Thotsem22' target='_blank' className='absolute bottom-12 text-lg text-green-600'>@sem</a>
    </div>
  );
};

export default LandingPage;