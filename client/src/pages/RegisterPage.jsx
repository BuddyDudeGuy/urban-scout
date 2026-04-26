/*
 * registration page - creates a new user account
 * after registering it auto-logs in and sends them to the home page
 * matches the login page styling with the blue header banner
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [error, setError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  /*
   * sends the registration request and navigates home on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser(name, email, homeCity);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-seoul-bg">
      {/* header banner */}
      <div className="bg-gradient-to-r from-seoul-primary to-[#2d5a8e] text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Join Urban Scout</h1>
        <p className="text-blue-200 text-sm">Start exploring Seoul today</p>
      </div>

      <div className="flex items-center justify-center p-6 min-h-[70vh]">
        <div className="w-full max-w-sm animate-slide-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">You'll be able to choose regions to follow after signing up</p>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-3"
              required
            />
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-3"
              required
            />
            <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Home City</label>
            <input
              type="text"
              placeholder="Home city (optional)"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white transition-colors mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="rounded-full bg-[#1E3A5F] text-white hover:bg-[#2d5a8e] w-full py-3 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Up
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-[#3B82F6] hover:underline cursor-pointer">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
